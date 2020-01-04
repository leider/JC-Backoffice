import misc from "../commons/misc";
import service from "./optionenService";
import store from "./optionenstore";
import puppeteerPrinter from "../commons/puppeteerPrinter";

import DatumUhrzeit from "../commons/DatumUhrzeit";
import OptionValues, { Hotelpreise, Kontakt } from "./optionValues";
import Orte from "./orte";
import FerienIcals from "./ferienIcals";
import { PDFOptions } from "puppeteer";
import conf from "../commons/simpleConfigure";
const publicUrlPrefix = conf.get("publicUrlPrefix");

const app = misc.expressAppIn(__dirname);

const printoptions: PDFOptions = {
  format: "A4",
  landscape: false, // portrait or landscape
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
};

app.get("/", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.optionen((err: Error | null, optionen: OptionValues) => {
    if (err) {
      return next(err);
    }
    return res.render("optionen", { optionen: optionen });
  });
});

app.get("/kassenbericht", (req, res) => {
  const now = new DatumUhrzeit();
  res.render("kassenberichtentry", { now });
});

app.get("/kassenbericht/:year/:month", (req, res, next) => {
  const month = req.params.month;
  const year = req.params.year;
  const datum = DatumUhrzeit.forYYYYMM(year + "" + month);
  const now = new DatumUhrzeit();
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  return app.render("kassenbericht", { datum, now, publicUrlPrefix }, puppeteerPrinter.generatePdf(printoptions, res, next));
});

app.get("/orte", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.orte((err: Error | null, orte: Orte) => {
    if (err) {
      return next(err);
    }
    return res.render("orte", { orte });
  });
});

app.get("/icals", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.icals((err: Error | null, icals: FerienIcals) => {
    if (err) {
      return next(err);
    }
    return res.render("icals", { icals: icals || {} });
  });
});

app.get("/agenturForAuswahl", (req, res) => {
  service.agenturForAuswahl(req.query.auswahl, (err: Error | null, kontakt: Kontakt) => res.send(kontakt));
});

app.get("/hotelForAuswahl", (req, res) => {
  service.hotelForAuswahl(req.query.auswahl, (err: Error | null, kontakt: Kontakt) => res.send(kontakt));
});

app.get("/preiseForAuswahl", (req, res) => {
  service.preiseForAuswahl(req.query.auswahl, (err: Error | null, preise: Hotelpreise) => res.send(preise));
});

app.post("/ortChanged", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  const ort = req.body;
  // eslint-disable-next-line no-underscore-dangle
  delete ort._csrf;
  return service.orte((err: Error | null, orte: Orte) => {
    if (err) {
      return next(err);
    }
    if (ort.name) {
      if (ort.oldname) {
        //ändern
        orte.updateOrt(ort.oldname, ort);
      } else {
        //neu
        orte.addOrt(ort);
      }
    } else {
      //löschen
      orte.deleteOrt(ort.oldname);
    }
    return store.save(orte, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("orte");
    });
  });
});

app.post("/icalChanged", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  const ical = req.body;
  // eslint-disable-next-line no-underscore-dangle
  delete ical._csrf;
  return service.icals((err: Error | null, icals: FerienIcals) => {
    if (err) {
      return next(err);
    }
    if (ical.name) {
      if (ical.oldname) {
        //ändern
        icals.updateIcal(ical.oldname, ical);
      } else {
        //neu
        icals.addIcal(ical);
      }
    } else {
      //löschen
      icals.deleteIcal(ical.oldname);
    }
    return store.save(icals, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("icals");
    });
  });
});

app.post("/submit", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  return service.optionen((err: Error | null, optionen: OptionValues) => {
    if (err) {
      return next(err);
    }
    optionen.fillFromUI(req.body);
    return store.save(optionen, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("/");
    });
  });
});

export default app;
