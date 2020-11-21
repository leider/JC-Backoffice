import express, { Request, Response, NextFunction } from "express";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import { gemaMeldungPdf } from "../pdf";

const app = express();

function printAsCsv(res: Response, selected: Veranstaltung[], nachmeldung: boolean) {
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

  res.setHeader("Content-disposition", "attachment; filename=" + (nachmeldung ? "nachmeldung" : "vorabmeldung") + ".csv");
  res.type("text/csv").send(createCSV(false, selected));
}

function createResult(
  eventAndDateiart: { event: string[]; dateiart: string; origin: string | string[] | undefined },
  res: Response,
  next: NextFunction,
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
      return gemaMeldungPdf(selected, nachmeldung, eventAndDateiart.origin, res, next);
    }
    return printAsCsv(res, selected, nachmeldung);
  });
}

app.get("/meldung", (req: Request, res: Response, next: NextFunction) => {
  const transferObject = JSON.parse(<string>req.query.transferObject);
  const event = transferObject.selectedIds;
  const dateiart = transferObject.renderart;
  const vorNach = transferObject.vorNach;
  const origin = new URL(req.headers.referer || "").origin;
  return createResult({ event, dateiart, origin }, res, next, vorNach);
});

export default app;
