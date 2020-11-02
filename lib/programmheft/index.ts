import store from "./kalenderstore";

import DatumUhrzeit from "../commons/DatumUhrzeit";
import Kalender from "./kalender";
import { expressAppIn } from "../middleware/expressViewHelper";
import { reply } from "../commons/replies";

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

  return store.getKalender(yearMonthString, (err?: Error, kalender?: Kalender) => {
    reply(res, err, kalender);
  });
});

app.post("/saveProgrammheft", (req, res) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  const kalender = new Kalender(req.body);
  return store.saveKalender(kalender, (err?: Error) => {
    reply(res, err, kalender);
  });
});

export default app;
