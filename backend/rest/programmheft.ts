import express from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";
import User from "jc-shared/user/user";

import store from "../lib/programmheft/kalenderstore";
import { resToJson } from "../lib/commons/replies";

const app = express();

app.get("/programmheft/:year/:month", async (req, res) => {
  let yearMonthString = `${req.params.year}/${req.params.month}`;
  if (parseInt(req.params.month) % 2 === 0) {
    const correctedDatum = DatumUhrzeit.forYYYYslashMM(yearMonthString).naechsterUngeraderMonat;
    yearMonthString = correctedDatum.fuerKalenderViews;
  }

  const kalender = await store.getKalender(yearMonthString);
  resToJson(res, kalender);
});

app.post("/programmheft", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }

  const kalender = new Kalender(req.body);
  await store.saveKalender(kalender);
  resToJson(res, kalender);
});

export default app;
