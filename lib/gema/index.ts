import express from "express";

import puppeteerPrinter from "../commons/puppeteerPrinter";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { PDFOptions } from "puppeteer";
import { expressAppIn } from "../middleware/expressViewHelper";
import conf from "../commons/simpleConfigure";

const app = expressAppIn(__dirname);
const publicUrlPrefix = conf.get("publicUrlPrefix");

const printoptions: PDFOptions = {
  format: "A4",
  landscape: true, // portrait or landscape
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
};

function createCSV(nachmeldung: boolean, events: Array<Veranstaltung>): string {
  const header = `Datum;Ort;Kooperation Mit;Veranstaltungsart;Musikwiedergabeart;Eintrittspreis;${
    nachmeldung ? "Einnahmen;" : ""
  }Anzahl Besucher;Rechnung An;Raumgröße\n`;
  const zeilen = events.map((e) => {
    const wiedergabeart = e.artist.bandname || e.artist.name.join(", ");
    const rechnungAn = e.kopf.rechnungAnKooperationspartner() ? e.kopf.kooperation : "Jazzclub";
    return `${e.datumForDisplay()};${e.kopf.ort};${e.kopf.kooperation};Jazzkonzert;${wiedergabeart};${e.preisAusweisGema()};${
      nachmeldung ? e.eintrittGema() + ";" : ""
    }${e.anzahlBesucher()};${rechnungAn};${e.kopf.flaeche}\n`;
  });
  let result = header;
  zeilen.forEach((z) => {
    result += z;
  });
  return result;
}

function createResult(
  eventAndDateiart: { event: string[]; dateiart: string; origin: string | string[] | undefined },
  res: express.Response,
  next: express.NextFunction,
  selector: "vergangene" | "zukuenftige"
): void {
  const { event, dateiart } = eventAndDateiart;
  const functionToCall = selector === "vergangene" ? store.vergangene : store.zukuenftige;
  const nachmeldung = selector === "vergangene";

  functionToCall((err: Error | null, veranstaltungen: Array<Veranstaltung>) => {
    if (err) {
      return next(err);
    }
    const selected = veranstaltungen.filter((veranst) => event.includes(veranst.id || ""));
    if (dateiart === "PDF") {
      return app.render(
        "meldung",
        {
          events: selected,
          nachmeldung,
          publicUrlPrefix: process.env.NODE_ENV === "production" ? publicUrlPrefix : eventAndDateiart.origin,
        },
        puppeteerPrinter.generatePdf(printoptions, res, next)
      );
    }
    res.setHeader("Content-disposition", "attachment; filename=" + (nachmeldung ? "nachmeldung" : "vorabmeldung") + ".csv");
    res.set("Content-Type", "text/csv");
    return res.send(createCSV(false, selected));
  });
}

app.get("/", (req, res) => {
  res.redirect("/vue/gema");
});

app.get("/meldung", (req, res, next) => {
  const transferObject = JSON.parse(<string>req.query.transferObject);
  const event = transferObject.selectedIds;
  const dateiart = transferObject.renderart;
  const vorNach = transferObject.vorNach;
  const origin = new URL(req.headers.referer || "").origin;
  return createResult({ event, dateiart, origin }, res, next, vorNach);
});

export default app;
