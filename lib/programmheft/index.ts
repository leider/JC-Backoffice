import store from "./kalenderstore";

import DatumUhrzeit from "../commons/DatumUhrzeit";
import Kalender from "./kalender";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

app.get("/", (req, res) => {
  res.redirect("/vue/programmheft");
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

app.get("/:year/:month", (req, res) => {
  res.redirect(`/vue/programmheft/${req.params.year}/${req.params.month}`);
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

export default app;
