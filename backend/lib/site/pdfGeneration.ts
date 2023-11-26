const __dirname = new URL(".", import.meta.url).pathname;
import { NextFunction, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";

import conf from "../../../shared/commons/simpleConfigure.js";
import store from "../veranstaltungen/veranstaltungenstore.js";
import vermietungenstore from "../vermietungen/vermietungenstore.js";
import veranstaltungenService from "../veranstaltungen/veranstaltungenService.js";
import userstore from "../users/userstore.js";
import { generatePdf, generatePdfLocally, printoptions } from "./pdfCommons.js";
import pug from "pug";
import path from "path";
import mailtransport from "../mailsender/mailtransport.js";
import Message from "jc-shared/mail/message.js";

const publicUrlPrefix = conf.get("publicUrlPrefix");

export function kassenbericht(res: Response, next: NextFunction, datum: DatumUhrzeit): void {
  const now = new DatumUhrzeit();
  return res.render("kassenbericht", { datum, now, publicUrlPrefix }, generatePdf(printoptions, res, next));
}

export async function vertrag(res: Response, next: NextFunction, veranstaltungUrl: string, language: string) {
  const veranstaltung = await store.getVeranstaltung(veranstaltungUrl);
  if (!veranstaltung) {
    return res.redirect("/");
  }
  const buyoutInclusive = language !== "regional";
  const sprache = language === "regional" ? "deutsch" : language;
  return res.render(
    `vertrag-${sprache}`,
    { veranstaltung, datum: new DatumUhrzeit(), buyoutInclusive, publicUrlPrefix },
    generatePdf({ ...printoptions, scale: 1.31, margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" } }, res, next),
  );
}

export async function vermietungAngebot(res: Response, next: NextFunction, vermietungUrl: string, art: string) {
  const vermietung = await vermietungenstore.getVermietung(vermietungUrl);
  if (!vermietung) {
    return res.redirect("/");
  }
  return res.render(
    "vertrag-vermietung",
    { vermietung, datum: new DatumUhrzeit(), art, publicUrlPrefix, einseitig: true },
    generatePdf({ ...printoptions, scale: 1.31, margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" } }, res, next),
  );
}

export async function kassenzettel(res: Response, next: NextFunction, veranstaltungUrl: string) {
  const veranstaltung = await veranstaltungenService.getVeranstaltung(veranstaltungUrl);
  if (!veranstaltung) {
    return res.redirect("/");
  }
  const user = await userstore.forId(veranstaltung.staff.kasseV[0]);
  const kassierer = user?.name || "";
  res.render("kassenzettel", { veranstaltung, kassierer, publicUrlPrefix }, generatePdf(printoptions, res, next));
}

export async function kassenzettelToBuchhaltung(veranstaltung: Veranstaltung) {
  const file = path.join(__dirname, "views/kassenzettel.pug");
  const user = await userstore.forId(veranstaltung.staff.kasseV[0]);
  const kassierer = user?.name || veranstaltung.kasse.kassenfreigabe;
  const renderedHtml = pug.renderFile(file, { veranstaltung, kassierer, publicUrlPrefix });
  const subject = `[Kassenzettel] ${veranstaltung.kopf.titelMitPrefix} am ${veranstaltung.startDatumUhrzeit.fuerPresse}`;
  const filenamepdf = `${veranstaltung.kopf.titelMitPrefix} am ${veranstaltung.startDatumUhrzeit.tagMonatJahrKompakt}.pdf`;
  generatePdfLocally(renderedHtml, (pdf: Buffer) => {
    const message = new Message({ subject, markdown: "" });
    message.pdfBufferAndName = { pdf, name: filenamepdf };
    message.to = conf.get("kassenzettel-email") as string;
    if (!message.to) {
      return;
    }
    return mailtransport.sendDatevMail(message);
  });
}
