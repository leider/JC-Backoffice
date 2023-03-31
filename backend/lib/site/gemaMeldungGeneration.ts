import conf from "../../../shared/commons/simpleConfigure.js";
import { NextFunction, Response } from "express";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import store from "../veranstaltungen/veranstaltungenstore.js";
import { generatePdf, printoptions } from "./pdfCommons.js";

const publicUrlPrefix = conf.get("publicUrlPrefix");

function gemaMeldungPdf(events: Veranstaltung[], nachmeldung: boolean, res: Response, next: NextFunction): void {
  res.render("meldung", { events, nachmeldung, publicUrlPrefix }, generatePdf({ ...printoptions, landscape: true }, res, next));
}

function gemaMeldungCsv(res: Response, selected: Veranstaltung[], nachmeldung: boolean) {
  function createCSV(nachmeldung: boolean, events: Array<Veranstaltung>): string {
    const header = `Datum;Ort;Kooperation Mit;Veranstaltungsart;Musikwiedergabeart;Eintrittspreis;${
      nachmeldung ? "Einnahmen;" : ""
    }Anzahl Besucher;Rechnung An;Raumgröße\n`;
    const zeilen = events.map((e) => {
      const wiedergabeart = e.artist.bandname || e.artist.name.join(", ");
      const rechnungAn = e.kopf.rechnungAnKooperationspartner ? e.kopf.kooperation : "Jazzclub";
      return `${e.datumForDisplay};${e.kopf.ort};${e.kopf.kooperation};Jazzkonzert;${wiedergabeart};${e.gema.preisAusweis};${
        nachmeldung ? `${e.gema.eintritt};` : ""
      }${e.gema.anzahlBesucher};${rechnungAn};${e.kopf.flaeche}\n`;
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

async function gemaResult(
  eventAndDateiart: { event: string[]; dateiart: string },
  res: Response,
  next: NextFunction,
  selector: "vergangene" | "zukuenftige"
) {
  const { event, dateiart } = eventAndDateiart;
  const functionToCall = selector === "vergangene" ? store.alle : store.zukuenftige;
  const nachmeldung = selector === "vergangene";

  try {
    const veranstaltungen = await functionToCall();
    const selected = veranstaltungen.filter((veranst) => event.includes(veranst.id || ""));
    if (dateiart === "PDF") {
      return gemaMeldungPdf(selected, nachmeldung, res, next);
    }
    return gemaMeldungCsv(res, selected, nachmeldung);
  } catch (e) {
    return next(e);
  }
}

export async function gemameldung(
  res: Response,
  next: NextFunction,
  transferObject: { selectedIds: string[]; renderart: string; vorNach: "vergangene" | "zukuenftige" }
) {
  const event = transferObject.selectedIds;
  const dateiart = transferObject.renderart;
  const vorNach = transferObject.vorNach;
  return gemaResult({ event, dateiart }, res, next, vorNach);
}
