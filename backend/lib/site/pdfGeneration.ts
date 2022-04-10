import { NextFunction, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import User from "jc-shared/user/user";

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

export function vertrag(res: Response, next: NextFunction, veranstaltungUrl: string, language: string): void {
  return store.getVeranstaltung(veranstaltungUrl, (err: Error | null, veranstaltung?: Veranstaltung) => {
    if (err) {
      return next(err);
    }
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
  });
}

export function kassenzettel(res: Response, next: NextFunction, veranstaltungUrl: string): void {
  veranstaltungenService.getVeranstaltungMitReservix(veranstaltungUrl, (err?: Error, veranstaltung?: Veranstaltung) => {
    if (err) {
      return next(err);
    }
    if (!veranstaltung) {
      return res.redirect("/");
    }
    return userstore.forId(veranstaltung.staff.kasseV[0], (err1?: Error, user?: User) => {
      const kassierer = user?.name || "";
      res.render("kassenzettel", { veranstaltung, kassierer, publicUrlPrefix }, generatePdf(printoptions, res, next));
    });
  });
}

export function kassenzettelToBuchhaltung(veranstaltung: Veranstaltung, callback: Function): void {
  const file = path.join(__dirname, "views/kassenzettel.pug");
  return userstore.forId(veranstaltung.staff.kasseV[0], (err1?: Error, user?: User) => {
    const kassierer = user?.name || veranstaltung.kasse.kassenfreigabe;
    const renderedHtml = pug.renderFile(file, { veranstaltung, kassierer, publicUrlPrefix });
    const subject = `[Kassenzettel] ${veranstaltung.kopf.titelMitPrefix} am ${veranstaltung.startDatumUhrzeit.fuerPresse}`;
    const filenamepdf = `${veranstaltung.kopf.titelMitPrefix} am ${veranstaltung.startDatumUhrzeit.tagMonatJahrKompakt}.pdf`;
    generatePdfLocally(renderedHtml, (pdf) => {
      const message = new Message({ subject, markdown: "" });
      message.pdfBufferAndName = { pdf, name: filenamepdf };
      message.to = conf.get("kassenzettel-email") as string;
      if (!message.to) {
        return callback();
      }
      mailtransport.sendDatevMail(message, (err2: Error) => {
        callback(err2);
      });
    });
  });
}
