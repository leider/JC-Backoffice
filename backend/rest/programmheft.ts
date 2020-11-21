import express from "express";

import store from "../lib/programmheft/kalenderstore";

import DatumUhrzeit from "../../shared/commons/DatumUhrzeit";
import Kalender from "../../shared/programmheft/kalender";
import { reply } from "../lib/commons/replies";

const app = express();

app.get("/programmheft/:year/:month", (req, res) => {
  let yearMonthString = `${req.params.year}/${req.params.month}`;
  if (parseInt(req.params.month) % 2 === 0) {
    const correctedDatum = DatumUhrzeit.forYYYYslashMM(yearMonthString).naechsterUngeraderMonat;
    yearMonthString = correctedDatum.fuerKalenderViews;
  }

  return store.getKalender(yearMonthString, (err?: Error, kalender?: Kalender) => {
    reply(res, err, kalender);
  });
});

app.post("/programmheft", (req, res) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  const kalender = new Kalender(req.body);
  return store.saveKalender(kalender, (err?: Error) => {
    reply(res, err, kalender);
  });
});

export default app;
