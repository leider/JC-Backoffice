import express, { Request, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kalender from "jc-shared/programmheft/kalender.js";

import store from "../lib/programmheft/kalenderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import User from "jc-shared/user/user.js";

const app = express();

app.get("/programmheft/alle", [checkOrgateam], (req: Request, res: Response) => {
  resToJson(res, store.alleKalender());
});

app.get("/programmheft/:year/:month", [checkOrgateam], (req: Request, res: Response) => {
  let yearMonthString = `${req.params.year}/${req.params.month}`;
  if (parseInt(req.params.month) % 2 === 0) {
    const correctedDatum = DatumUhrzeit.forYYYYslashMM(yearMonthString).naechsterUngeraderMonat;
    yearMonthString = correctedDatum.fuerKalenderViews;
  }

  resToJson(res, store.getKalender(yearMonthString));
});

app.post("/programmheft", [checkOrgateam], (req: Request, res: Response) => {
  const kalender = new Kalender(req.body);
  store.saveKalender(kalender, req.user as User);
  resToJson(res, kalender);
});

export default app;
