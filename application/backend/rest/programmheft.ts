import express, { Request, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kalender from "jc-shared/programmheft/kalender.js";

import store from "../lib/programmheft/kalenderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import User from "jc-shared/user/user.js";

const app = express();

app.get("/programmheft/alle", [checkOrgateam], (req: Request, res: Response) => {
  const alleKalender = store.alleKalender();
  resToJson(res, alleKalender);
});

app.get("/programmheft/:year/:month", [checkOrgateam], (req: Request, res: Response) => {
  const year = req.params.year as string;
  const month = req.params.month as string;
  let yearMonthString = `${year}/${month}`;
  if (parseInt(month) % 2 === 0) {
    const correctedDatum = DatumUhrzeit.forYYYYslashMM(yearMonthString).naechsterUngeraderMonat;
    yearMonthString = correctedDatum.fuerKalenderViews;
  }

  const kalender = store.getKalender(yearMonthString);
  kalender?.sortEvents();
  resToJson(res, kalender);
});

app.post("/programmheft", [checkOrgateam], (req: Request, res: Response) => {
  const kalender = new Kalender(req.body);
  store.saveKalender(kalender, req.user as User);
  resToJson(res, kalender);
});

export default app;
