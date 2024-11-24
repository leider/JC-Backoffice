import express, { Request, Response } from "express";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kalender from "jc-shared/programmheft/kalender.js";

import store from "../lib/programmheft/kalenderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import User from "jc-shared/user/user.js";
import userstore from "../lib/users/userstore.js";

const app = express();

function migrateToNewStructure(alleKalender: Kalender[], currentUser: User) {
  const allUsers = userstore.allUsers();
  allUsers.push(new User({ id: "booking", name: "Booking Team", email: "booking@jazzclub.de" }));
  alleKalender.forEach((kalender) => {
    if (!kalender.migrated) {
      kalender.events.forEach((event) => {
        event.enhance(allUsers);
      });
      kalender.migrated = true;
      store.saveKalender(kalender, currentUser);
    }
  });
}

app.get("/programmheft/alle", [checkOrgateam], (req: Request, res: Response) => {
  const alleKalender = store.alleKalender();
  migrateToNewStructure(alleKalender, req.user as User);
  resToJson(res, alleKalender);
});

app.get("/programmheft/:year/:month", [checkOrgateam], (req: Request, res: Response) => {
  let yearMonthString = `${req.params.year}/${req.params.month}`;
  if (parseInt(req.params.month) % 2 === 0) {
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
