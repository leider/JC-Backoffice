import { NextFunction, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

import conf from "../commons/simpleConfigure";
import store from "../veranstaltungen/veranstaltungenstore";
import veranstaltungenService from "../veranstaltungen/veranstaltungenService";
import userstore from "../users/userstore";
import { generatePdf, generatePdfLocally, printoptions } from "./pdfCommons";
import pug from "pug";
import path from "path";
import mailtransport from "../mailsender/mailtransport";
import Message from "jc-shared/mail/message";

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
    generatePdf({ ...printoptions, scale: 1.31, margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" } }, res, next)
  );
}

export async function kassenzettel(res: Response, next: NextFunction, veranstaltungUrl: string) {
  const veranstaltung = await veranstaltungenService.getVeranstaltungMitReservix(veranstaltungUrl);
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
