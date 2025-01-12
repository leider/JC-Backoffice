import { NextFunction, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Konzert from "jc-shared/konzert/konzert.js";

import conf from "jc-shared/commons/simpleConfigure.js";
import store from "../konzerte/konzertestore.js";
import vermietungenstore from "../vermietungen/vermietungenstore.js";
import konzerteService from "../konzerte/konzerteService.js";
import userstore from "../users/userstore.js";
import { generatePdf, printoptions, printoptions131, printoptionsRider } from "./pdfCommons.js";
import pug from "pug";
import path from "path";
import Path, { dirname } from "path";
import mailtransport from "../mailsender/mailtransport.js";
import riderstore from "../rider/riderstore.js";
import { PrintableBox } from "jc-shared/rider/rider.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import { fileURLToPath } from "url";
import Fs from "fs/promises";
import { PDFOptions } from "puppeteer";
import MailMessage from "jc-shared/mail/mailMessage.js";
import map from "lodash/map.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const publicUrlPrefix = conf.publicUrlPrefix;

function renderPug(template: string, options: object) {
  const file = path.join(__dirname, `views/${template}.pug`);
  return pug.renderFile(file, Object.assign(options, { publicUrlPrefix }));
}

async function generatePdfAndSend(res: Response, next: NextFunction, html: string, options?: PDFOptions) {
  try {
    const pdf = await generatePdf(html, options);
    res.set("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (e) {
    next(new Error(`PDF Erzeugung nicht erfolgreich wegen (${(e as Error)?.message})`));
  }
}

export async function kassenbericht(res: Response, next: NextFunction, datum: DatumUhrzeit) {
  const now = new DatumUhrzeit();
  generatePdfAndSend(res, next, renderPug("kassenbericht", { datum, now }));
}

export async function vertrag(res: Response, next: NextFunction, konzertUrl: string, language: string) {
  const konzert = await store.getKonzert(konzertUrl);
  if (!konzert) {
    return res.redirect("/");
  }
  const buyoutInclusive = language !== "regional";
  const sprache = language === "regional" ? "deutsch" : language;
  generatePdfAndSend(
    res,
    next,
    renderPug(`vertrag-${sprache}`, {
      veranstaltung: konzert,
      datum: new DatumUhrzeit(),
      buyoutInclusive,
      email: "vertrag",
    }),
    printoptions131,
  );
}

export async function vermietungAngebot(res: Response, next: NextFunction, vermietungUrl: string, art: "Angebot" | "Vertrag" | "Rechnung") {
  const vermietung = await vermietungenstore.getVermietung(vermietungUrl);
  if (!vermietung) {
    return res.redirect("/");
  }
  vermietung.art = art;
  try {
    await saveVermietungToShare(vermietung);
  } catch (e) {
    next(e);
  }
  generatePdfAndSend(res, next, renderVermietung(vermietung, new DatumUhrzeit()), printoptions131);
}

export async function kassenzettel(res: Response, next: NextFunction, konzertUrl: string) {
  const konzert = await konzerteService.getKonzert(konzertUrl);
  if (!konzert) {
    return res.redirect("/");
  }
  const user = await userstore.forId(konzert.staff.kasseV[0]);
  const kassierer = user?.name || "";
  generatePdfAndSend(res, next, renderPug("kassenzettel", { veranstaltung: konzert, kassierer }), printoptions);
}

export async function riderPdf(res: Response, next: NextFunction, url: string) {
  const rider = await riderstore.getRider(url);
  const konzert = await konzerteService.getKonzert(url);
  if (!rider || !konzert) {
    return res.redirect("/");
  }

  const boxes = map(rider.boxes, (box) => new PrintableBox(box));
  generatePdfAndSend(res, next, renderPug("rider", { veranstaltung: konzert, boxes }), printoptionsRider);
}

export async function kassenzettelToBuchhaltung(konzert: Konzert) {
  if (!conf.kassenzettelEmail) {
    return;
  }
  const user = await userstore.forId(konzert.staff.kasseV[0]);
  const kassierer = user?.name ?? konzert.kasse.kassenfreigabe;
  const content = await generatePdf(renderPug("kassenzettel", { veranstaltung: konzert, kassierer, publicUrlPrefix }));
  const filename = `${konzert.kopf.titelMitPrefix} am ${konzert.startDatumUhrzeit.tagMonatJahrKompakt}.pdf`;

  const subject = `[Kassenzettel] ${konzert.kopf.titelMitPrefix} am ${konzert.startDatumUhrzeit.fuerPresse}`;
  const mailmessage = new MailMessage({ subject });
  mailmessage.attach({ content, filename });
  mailmessage.to = [{ name: "", address: conf.kassenzettelEmail }];
  return mailtransport.sendDatevMail(mailmessage);
}

function renderVermietung(vermietung: Vermietung, now: DatumUhrzeit) {
  return renderPug("vertrag-vermietung", {
    vermietung,
    datum: now,
    einseitig: true,
    email: "event",
  });
}
async function vermietungToPdf(vermietung: Vermietung) {
  const now = new DatumUhrzeit();
  const content = await generatePdf(renderVermietung(vermietung, now), printoptions131);
  const filename = `${vermietung.kopf.titelMitPrefix} am ${vermietung.startDatumUhrzeit.tagMonatJahrKompakt} (${vermietung.art} ${now.fuerCalendarWidget}).pdf`;
  return { content, filename };
}

export async function vermietungVertragToBuchhaltung(vermietung: Vermietung) {
  if (!conf.kassenzettelEmail) {
    return;
  }
  const attachment = await vermietungToPdf(vermietung);
  const subject = `[Vertrag] ${vermietung.kopf.titelMitPrefix} am ${vermietung.startDatumUhrzeit.fuerPresse}`;
  const mailmessage = new MailMessage({ subject });
  mailmessage.attach(attachment);
  mailmessage.to = [{ name: "", address: conf.kassenzettelEmail }];
  return mailtransport.sendDatevMail(mailmessage);
}

export async function saveVermietungToShare(vermietung: Vermietung) {
  if (!conf.pdfuploadpath) {
    return;
  }
  const { content, filename } = await vermietungToPdf(vermietung);
  const directory = Path.join(
    conf.pdfuploadpath,
    vermietung.startDatumUhrzeit.jahr.toString(10),
    `${vermietung.startDatumUhrzeit.monatTag} ${vermietung.kopf.titel}`,
  );
  try {
    await Fs.mkdir(directory, { recursive: true });
    return Fs.writeFile(Path.join(directory, filename), content);
  } catch {
    // we can do nothing here...
  }
}
