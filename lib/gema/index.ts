import express from "express";

import misc from "../commons/misc";
import puppeteerPrinter from "../commons/puppeteerPrinter";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { PDFOptions } from "puppeteer";

const app = misc.expressAppIn(__dirname);
import conf from "../commons/simpleConfigure";
const publicUrlPrefix = conf.get("publicUrlPrefix");

const printoptions: PDFOptions = {
  format: "A4",
  landscape: true, // portrait or landscape
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
};

function createCSV(nachmeldung: boolean, events: Array<Veranstaltung>): string {
  const header = `Datum;Ort;Kooperation Mit;Veranstaltungsart;Musikwiedergabeart;Eintrittspreis;${
    nachmeldung ? "Einnahmen;" : ""
  }Anzahl Besucher;Rechnung An;Raumgröße\n`;
  const zeilen = events.map(e => {
    const wiedergabeart =
      e.artist().bandname() ||
      e
        .artist()
        .name()
        .join(", ");
    const rechnungAn = e.kopf().rechnungAnKooperation() ? e.kopf().kooperation() : "Jazzclub";
    return `${e.datumForDisplay()};${e.kopf().ort()};${e.kopf().kooperation()};Jazzkonzert;${wiedergabeart};${e.preisAusweisGema()};${
      nachmeldung ? e.eintrittGema() + ";" : ""
    }${e.anzahlBesucher()};${rechnungAn};${e.kopf().flaeche()}\n`;
  });
  let result = header;
  zeilen.forEach(z => {
    result += z;
  });
  return result;
}

function createResult(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  selector: "vergangene" | "zukuenftige",
  nachmeldung: boolean
): void {
  const functionToCall = selector === "vergangene" ? store.vergangene : store.zukuenftige;
  functionToCall((err: Error | null, veranstaltungen: Array<Veranstaltung>) => {
    if (err) {
      return next(err);
    }
    const event = Object.keys(req.body.event);
    const selected = veranstaltungen.filter(veranst => event.includes(veranst.id()));
    const dateiart = req.body.dateiart;
    if (dateiart === "PDF") {
      return app.render(
        "meldung",
        {
          events: selected,
          nachmeldung,
          publicUrlPrefix: publicUrlPrefix
        },
        puppeteerPrinter.generatePdf(printoptions, res, next)
      );
    }
    res.setHeader("Content-disposition", "attachment; filename=" + (nachmeldung ? "nachmeldung" : "vorabmeldung") + ".csv");
    res.set("Content-Type", "text/csv");
    return res.send(createCSV(false, selected));
  });
}

app.get("/", (req, res, next) => {
  store.zukuenftige((err: Error | null, zukuenftige: Array<Veranstaltung>) => {
    if (err) {
      return next(err);
    }
    return store.vergangene((err1: Error | null, vergangene: Array<Veranstaltung>) => {
      if (err1) {
        return next(err1);
      }
      return res.render("choose", {
        upcomingEvents: zukuenftige,
        pastEvents: vergangene
      });
    });
  });
});

app.post("/vorab", (req, res, next) => {
  if (!req.body.event) {
    return res.redirect("/gema");
  }
  return createResult(req, res, next, "zukuenftige", false);
});

app.post("/nach", (req, res, next) => {
  if (!req.body.event) {
    return res.redirect("/gema");
  }
  return createResult(req, res, next, "vergangene", true);
});

export default app;
