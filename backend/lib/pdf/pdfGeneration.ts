import { NextFunction, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Konzert from "jc-shared/konzert/konzert.js";

import conf from "jc-shared/commons/simpleConfigure.js";
import store from "../konzerte/konzertestore.js";
import vermietungenstore from "../vermietungen/vermietungenstore.js";
import konzerteService from "../konzerte/konzerteService.js";
import userstore from "../users/userstore.js";
import { generatePdf, generatePdfLocally, printoptions } from "./pdfCommons.js";
import pug from "pug";
import path, { dirname } from "path";
import mailtransport from "../mailsender/mailtransport.js";
import Message from "jc-shared/mail/message.js";
import riderstore from "../rider/riderstore.js";
import { PrintableBox } from "jc-shared/rider/rider.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import { fileURLToPath } from "url";
import Fs from "fs/promises";
import Path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const publicUrlPrefix = conf.publicUrlPrefix;

export function kassenbericht(res: Response, next: NextFunction, datum: DatumUhrzeit): void {
  const now = new DatumUhrzeit();
  return res.render("kassenbericht", { datum, now, publicUrlPrefix }, generatePdf(printoptions, res, next));
}

export async function vertrag(res: Response, next: NextFunction, konzertUrl: string, language: string) {
  const konzert = await store.getKonzert(konzertUrl);
  if (!konzert) {
    return res.redirect("/");
  }
  const buyoutInclusive = language !== "regional";
  const sprache = language === "regional" ? "deutsch" : language;
  return res.render(
    `vertrag-${sprache}`,
    { veranstaltung: konzert, datum: new DatumUhrzeit(), buyoutInclusive, publicUrlPrefix, email: "vertrag" },
    generatePdf({ ...printoptions, scale: 1.31, margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" } }, res, next),
  );
}

export async function vermietungAngebot(res: Response, next: NextFunction, vermietungUrl: string, art: string) {
  const vermietung = await vermietungenstore.getVermietung(vermietungUrl);
  if (!vermietung) {
    return res.redirect("/");
  }
  saveVermietungToShare(vermietung);

  return res.render(
    "vertrag-vermietung",
    { vermietung, datum: new DatumUhrzeit(), art, publicUrlPrefix, einseitig: true, email: "event" },
    generatePdf({ ...printoptions, scale: 1.31, margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" } }, res, next),
  );
}

export async function kassenzettel(res: Response, next: NextFunction, konzertUrl: string) {
  const konzert = await konzerteService.getKonzert(konzertUrl);
  if (!konzert) {
    return res.redirect("/");
  }
  const user = await userstore.forId(konzert.staff.kasseV[0]);
  const kassierer = user?.name || "";
  res.render("kassenzettel", { veranstaltung: konzert, kassierer, publicUrlPrefix }, generatePdf(printoptions, res, next));
}

export async function riderPdf(res: Response, next: NextFunction, url: string) {
  const rider = await riderstore.getRider(url);
  const konzert = await konzerteService.getKonzert(url);

  if (!rider) {
    return res.redirect("/");
  }
  const boxes = rider.boxes.map((box) => new PrintableBox(box));

  //return res.render("rider", { boxes, veranstaltung, publicUrlPrefix });
  res.render(
    "rider",
    { boxes, veranstaltung: konzert, publicUrlPrefix },
    generatePdf(
      {
        format: "a4",
        landscape: true,
        scale: 1,
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      },
      res,
      next,
    ),
  );
}

export async function kassenzettelToBuchhaltung(konzert: Konzert) {
  const file = path.join(__dirname, "views/kassenzettel.pug");
  const user = await userstore.forId(konzert.staff.kasseV[0]);
  const kassierer = user?.name || konzert.kasse.kassenfreigabe;
  const renderedHtml = pug.renderFile(file, { veranstaltung: konzert, kassierer, publicUrlPrefix });
  const subject = `[Kassenzettel] ${konzert.kopf.titelMitPrefix} am ${konzert.startDatumUhrzeit.fuerPresse}`;
  const filenamepdf = `${konzert.kopf.titelMitPrefix} am ${konzert.startDatumUhrzeit.tagMonatJahrKompakt}.pdf`;
  generatePdfLocally(renderedHtml, (pdf: Buffer) => {
    const message = new Message({ subject, markdown: "" });
    message.pdfBufferAndName = { pdf, name: filenamepdf };
    message.to = conf.kassenzettelEmail;
    if (!message.to) {
      return;
    }
    return mailtransport.sendDatevMail(message);
  });
}

export async function vermietungVertragToBuchhaltung(vermietung: Vermietung) {
  const file = path.join(__dirname, "views/vertrag-vermietung.pug");
  const renderedHtml = pug.renderFile(file, {
    vermietung,
    datum: new DatumUhrzeit(),
    art: "Rechnung",
    publicUrlPrefix,
    einseitig: true,
    email: "event",
  });
  const subject = `[Vertrag] ${vermietung.kopf.titelMitPrefix} am ${vermietung.startDatumUhrzeit.fuerPresse}`;
  const filenamepdf = `${vermietung.kopf.titelMitPrefix} am ${vermietung.startDatumUhrzeit.tagMonatJahrKompakt}.pdf`;
  generatePdfLocally(renderedHtml, (pdf: Buffer) => {
    const message = new Message({ subject, markdown: "" });
    message.pdfBufferAndName = { pdf, name: filenamepdf };
    message.to = conf.kassenzettelEmail;
    if (!message.to) {
      return;
    }
    return mailtransport.sendDatevMail(message);
  });
}
export async function saveVermietungToShare(vermietung: Vermietung) {
  if (!conf.pdfuploadpath) {
    return;
  }
  const file = path.join(__dirname, "views/vertrag-vermietung.pug");
  const now = new DatumUhrzeit();
  const renderedHtml = pug.renderFile(file, {
    vermietung,
    datum: now,
    art: vermietung.art,
    publicUrlPrefix,
    einseitig: true,
    email: "event",
  });
  const filenamepdf = `${vermietung.kopf.titelMitPrefix} am ${vermietung.startDatumUhrzeit.tagMonatJahrKompakt} (${vermietung.art} ${now.fuerCalendarWidget}).pdf`;
  const directory = Path.join(
    conf.pdfuploadpath,
    vermietung.startDatumUhrzeit.jahr.toString(10),
    `${vermietung.startDatumUhrzeit.monatTag} ${vermietung.kopf.titel}`,
  );
  generatePdfLocally(renderedHtml, async (pdf: Buffer) => {
    await Fs.mkdir(directory, { recursive: true });
    const filepath = Path.join(directory, filenamepdf);
    Fs.writeFile(filepath, pdf);
  });
}
