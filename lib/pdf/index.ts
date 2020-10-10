import puppeteerPrinter from "../commons/puppeteerPrinter";
import DatumUhrzeit from "../commons/DatumUhrzeit";
import { PDFOptions } from "puppeteer";
import conf from "../commons/simpleConfigure";
import { expressAppIn } from "../middleware/expressViewHelper";
import { NextFunction, Request, Response } from "express";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import store from "../veranstaltungen/veranstaltungenstore";

const publicUrlPrefix = conf.get("publicUrlPrefix");

const app = expressAppIn(__dirname);
export default app;

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
  return app.render("kassenbericht", { datum, now, publicUrlPrefix }, puppeteerPrinter.generatePdf(printoptions, res, next));
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
        puppeteerPrinter.generatePdf(
          { ...printoptions, scale: 1.31, margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" } },
          res,
          next
        )
      );
      // res.render(language, {veranstaltung, datum: new DatumUhrzeit(), buyoutInclusive, publicUrlPrefix: publicUrlPrefix});
    });
  }
  // language -> Deutsch, Englisch, Regional
  const language = req.params.language.toLowerCase();
  const sprache = language === "regional" ? "deutsch" : language;
  renderVertrag(sprache, language !== "regional", req, res, next);
});

export const gemaMeldungPdf = (
  events: Veranstaltung[],
  nachmeldung: boolean,
  origin: string | string[] | undefined,
  res: Response,
  next: NextFunction
): void => {
  const prefix = process.env.NODE_ENV === "production" ? publicUrlPrefix : origin;
  app.render(
    "meldung",
    { events, nachmeldung, publicUrlPrefix: prefix },
    puppeteerPrinter.generatePdf({ ...printoptions, landscape: true }, res, next)
  );
};

export const kassenzettelPdf = (veranstaltung: Veranstaltung, kassierer: string, res: Response, next: NextFunction): void => {
  app.render("kassenzettel", { veranstaltung, kassierer, publicUrlPrefix }, puppeteerPrinter.generatePdf(printoptions, res, next));
};
