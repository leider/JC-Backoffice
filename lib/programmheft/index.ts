import { groupBy } from "lodash";
import store from "./kalenderstore";

import veranstaltungenstore from "../veranstaltungen/veranstaltungenstore";
import DatumUhrzeit from "../commons/DatumUhrzeit";
import Kalender from "./kalender";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

app.get("/", (req, res) => {
  res.redirect(new DatumUhrzeit().naechsterUngeraderMonat.fuerKalenderViews);
});

app.get("/kalenderFor", (req, res, next) => {
  const from = DatumUhrzeit.forISOString(req.query.start);
  const addend = from.istGeraderMonat ? 1 : 2; // wir wollen die 2 Monate vor dem Programmheft, gespeichert ist es aber zum Heftstart
  store.getKalender(from.plus({ monate: addend }).fuerKalenderViews, (err: Error | null, kalender: Kalender) => {
    if (err) {
      return next(err);
    }
    if (!kalender) {
      return res.end("{}");
    }
    return res.end(JSON.stringify(kalender.asEvents()));
  });
});

app.get("/:year/:month.json", (req, res) => {
  let yearMonthString = `${req.params.year}/${req.params.month}`;
  if (parseInt(req.params.month) % 2 === 0) {
    const correctedDatum = DatumUhrzeit.forYYYYslashMM(yearMonthString).naechsterUngeraderMonat;
    yearMonthString = correctedDatum.fuerKalenderViews;
  }

  return store.getKalender(yearMonthString, (err: Error | null, kalender: Kalender) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(kalender);
  });
});

app.post("/saveProgrammheft", (req, res) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  const kalender = new Kalender(req.body);
  return store.saveKalender(kalender, (err: Error | null) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(kalender);
  });
});

app.get("/:year/:month", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  const year = req.params.year;
  const month = req.params.month;
  const start = DatumUhrzeit.forYYYYMM(year + "" + month);
  if (parseInt(month) % 2 === 0) {
    return res.redirect("/programmheft/" + DatumUhrzeit.forYYYYMM(year + "" + month).naechsterUngeraderMonat.fuerKalenderViews);
  }
  const end = start.plus({ monate: 2 });

  return store.getKalender(year + "/" + month, (err: Error | null, kalender: Kalender) => {
    if (err) {
      return next(err);
    }
    return veranstaltungenstore.byDateRangeInAscendingOrder(start, end, (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
      if (err1) {
        return next(err1);
      }
      const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed);
      const unconfirmedVeranstaltungen = veranstaltungen.filter((v) => !v.kopf.confirmed);
      const groupedVeranstaltungen = groupBy(filteredVeranstaltungen, (veranst) => veranst.startDatumUhrzeit().monatLangJahrKompakt);
      return res.render("heft", {
        unconfirmedVeranstaltungen,
        groupedVeranstaltungen,
        start,
        kalender,
      });
    });
  });
});

app.post("/submit", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  const body = req.body;
  return store.getKalender(body.id, (err: Error | null, kalender: Kalender) => {
    if (err) {
      return next(err);
    }
    kalender.text = body.text;
    return store.saveKalender(kalender, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect(body.id);
    });
  });
});

export default app;
