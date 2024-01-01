import express, { Request, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kalender from "jc-shared/programmheft/kalender.js";

import store from "../lib/programmheft/kalenderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { checkOrgateam } from "./checkAccessHandlers.js";

const app = express();

app.get("/programmheft/:year/:month", [checkOrgateam], async (req: Request, res: Response) => {
  let yearMonthString = `${req.params.year}/${req.params.month}`;
  if (parseInt(req.params.month) % 2 === 0) {
    const correctedDatum = DatumUhrzeit.forYYYYslashMM(yearMonthString).naechsterUngeraderMonat;
    yearMonthString = correctedDatum.fuerKalenderViews;
  }

  const kalender = await store.getKalender(yearMonthString);
  resToJson(res, kalender);
});

app.post("/programmheft", [checkOrgateam], async (req: Request, res: Response) => {
  const kalender = new Kalender(req.body);
  await store.saveKalender(kalender);
  resToJson(res, kalender);
});

export default app;
