import express from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";
import User from "jc-shared/user/user";

import store from "../lib/programmheft/kalenderstore";
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
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }

  const kalender = new Kalender(req.body);
  return store.saveKalender(kalender, (err?: Error) => {
    reply(res, err, kalender);
  });
});

export default app;
