import express, { Request, Response } from "express";

import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import FerienIcals from "jc-shared/optionen/ferienIcals";
import Termin from "jc-shared/optionen/termin";
import User from "jc-shared/user/user";

import store from "../lib/optionen/optionenstore";
import terminstore from "../lib/optionen/terminstore";
import { reply, resToJson } from "../lib/commons/replies";

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

app.get("/termine", (req, res) => {
  terminstore.alle((err?: Error, termine?: Termin[]) => {
    reply(res, err, termine);
  });
});

app.post("/termin", (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const termin = new Termin(req.body);
  delete termin.originalBeschreibung;
  terminstore.save(termin, (err: Error | null) => {
    reply(res, err, termin);
  });
});

app.delete("/termin", (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const id = req.body.id;
  terminstore.remove(id, (err: Error | null) => {
    reply(res, err);
  });
});

export default app;
