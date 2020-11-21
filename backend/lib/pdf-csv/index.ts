import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";
import puppeteer, { PDFOptions } from "puppeteer";
import conf from "../commons/simpleConfigure";
import express, { NextFunction, Request, Response } from "express";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import store from "../veranstaltungen/veranstaltungenstore";
import veranstaltungenService from "../veranstaltungen/veranstaltungenService";
import userstore from "../users/userstore";
import User from "../../../shared/user/user";
import path from "path";

const publicUrlPrefix = conf.get("publicUrlPrefix");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

export default app;

function generatePdf(options: PDFOptions, res: express.Response, next: express.NextFunction) {
  return (err: Error | null, html?: string): void => {
    if (err) {
      next(err);
    } else {
      (async (): Promise<void> => {
        const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.emulateMediaType("screen");
        await page.goto(`data:text/html,${html}`, {
          waitUntil: "networkidle0",
        });
        const pdf1 = await page.pdf(options);
        await browser.close();
        res.set("Content-Type", "application/pdf");
        res.send(pdf1);
      })();
    }
  };
}

const printoptions: PDFOptions = {
  format: "A4",
  landscape: false, // portrait or landscape
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
};

app.get("/kassenbericht/:year/:month", (req: Request, res: Response, next: NextFunction) => {
  const month = req.params.month;
  const year = req.params.year;
  const datum = DatumUhrzeit.forYYYYMM(year + "" + month);
  const now = new DatumUhrzeit();
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  return app.render("kassenbericht", { datum, now, publicUrlPrefix }, generatePdf(printoptions, res, next));
});

app.get("/vertrag/:url/:language", (req, res, next) => {
  function renderVertrag(language: string, buyoutInclusive: boolean, req: Request, res: Response, next: NextFunction): void {
    if (!res.locals.accessrights.isBookingTeam()) {
      return res.redirect("/");
    }
    return store.getVeranstaltung(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
      if (err1) {
        return next(err1);
      }
      if (!veranstaltung) {
        return res.redirect("/");
      }
      return app.render(
        `vertrag-${language}`,
        { veranstaltung, datum: new DatumUhrzeit(), buyoutInclusive, publicUrlPrefix },
        generatePdf({ ...printoptions, scale: 1.31, margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" } }, res, next)
      );
      // res.render(language, {veranstaltung, datum: new DatumUhrzeit(), buyoutInclusive, publicUrlPrefix: publicUrlPrefix});
    });
  }
  // language -> Deutsch, Englisch, Regional
  const language = req.params.language.toLowerCase();
  const sprache = language === "regional" ? "deutsch" : language;
  renderVertrag(sprache, language !== "regional", req, res, next);
});

app.get("/kassenzettel/:url", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isAbendkasse()) {
    return res.redirect("/");
  }

  return veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err?: Error, veranstaltung?: Veranstaltung) => {
    if (err) {
      return next(err);
    }
    if (!veranstaltung) {
      return res.redirect("/veranstaltungen/zukuenftige");
    }
    return userstore.forId(veranstaltung.staff.kasseV[0], (err1?: Error, user?: User) => {
      const kassierer = user?.name || "";
      app.render("kassenzettel", { veranstaltung, kassierer, publicUrlPrefix }, generatePdf(printoptions, res, next));
    });
  });
});

function gemaResult(
  eventAndDateiart: { event: string[]; dateiart: string; origin: string | string[] | undefined },
  res: Response,
  next: NextFunction,
  selector: "vergangene" | "zukuenftige"
): void {
  const { event, dateiart } = eventAndDateiart;
  const functionToCall = selector === "vergangene" ? store.vergangene : store.zukuenftige;
  const nachmeldung = selector === "vergangene";

  function gemaMeldungPdf(
    events: Veranstaltung[],
    nachmeldung: boolean,
    origin: string | string[] | undefined,
    res: Response,
    next: NextFunction
  ): void {
    const prefix = process.env.NODE_ENV === "production" ? publicUrlPrefix : origin;
    app.render("meldung", { events, nachmeldung, publicUrlPrefix: prefix }, generatePdf({ ...printoptions, landscape: true }, res, next));
  }

  function gemaMeldungCsv(res: Response, selected: Veranstaltung[], nachmeldung: boolean) {
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

  functionToCall((err: Error | null, veranstaltungen: Array<Veranstaltung>) => {
    if (err) {
      return next(err);
    }
    const selected = veranstaltungen.filter((veranst) => event.includes(veranst.id || ""));
    if (dateiart === "PDF") {
      return gemaMeldungPdf(selected, nachmeldung, eventAndDateiart.origin, res, next);
    }
    return gemaMeldungCsv(res, selected, nachmeldung);
  });
}

app.get("/gemameldung", (req: Request, res: Response, next: NextFunction) => {
  const transferObject = JSON.parse(<string>req.query.transferObject);
  const event = transferObject.selectedIds;
  const dateiart = transferObject.renderart;
  const vorNach = transferObject.vorNach;
  const origin = new URL(req.headers.referer || "").origin;
  return gemaResult({ event, dateiart, origin }, res, next, vorNach);
});
