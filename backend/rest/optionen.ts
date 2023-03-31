import express, { Request, Response } from "express";

import OptionValues from "jc-shared/optionen/optionValues.js";
import Orte from "jc-shared/optionen/orte.js";
import FerienIcals from "jc-shared/optionen/ferienIcals.js";
import Termin from "jc-shared/optionen/termin.js";
import User from "jc-shared/user/user.js";

import store from "../lib/optionen/optionenstore.js";
import terminstore from "../lib/optionen/terminstore.js";
import { resToJson } from "../lib/commons/replies.js";

const app = express();

app.get("/optionen", async (req: Request, res: Response) => {
  const optionen = await store.get();
  resToJson(res, optionen);
});

app.post("/optionen", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const optionen = new OptionValues(req.body);
  await store.save(optionen);
  resToJson(res, optionen);
});

app.get("/orte", async (req: Request, res: Response) => {
  const orte = await store.orte();
  resToJson(res, orte);
});

app.post("/orte", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const orte = new Orte(req.body);
  await store.save(orte);
  resToJson(res, orte);
});

app.get("/kalender", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }

  const icals = await store.icals();
  resToJson(res, icals);
});

app.post("/kalender", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const ical = new FerienIcals(req.body);
  await store.save(ical);
  resToJson(res, ical);
});

app.get("/termine", async (req, res) => {
  const termine = await terminstore.alle();
  resToJson(res, termine);
});

app.post("/termin", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const termin = new Termin(req.body);
  delete termin.originalBeschreibung;
  await terminstore.save(termin);
  resToJson(res, termin);
});

app.delete("/termin", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const id = req.body.id;
  await terminstore.remove(id);
  resToJson(res);
});

export default app;
