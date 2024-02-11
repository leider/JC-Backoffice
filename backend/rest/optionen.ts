import express, { Request, Response } from "express";

import OptionValues from "jc-shared/optionen/optionValues.js";
import Orte from "jc-shared/optionen/orte.js";
import FerienIcals from "jc-shared/optionen/ferienIcals.js";
import Termin from "jc-shared/optionen/termin.js";

import store from "../lib/optionen/optionenstore.js";
import terminstore from "../lib/optionen/terminstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { calculateChangedAndDeleted } from "jc-shared/commons/compareObjects.js";
import misc from "jc-shared/commons/misc.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import User from "jc-shared/user/user.js";

const app = express();

app.get("/optionen", async (req: Request, res: Response) => {
  const optionen = await store.get();
  resToJson(res, optionen);
});

app.post("/optionen", [checkOrgateam], async (req: Request, res: Response) => {
  const optionen = new OptionValues(req.body);
  await store.save(optionen, req.user as User);
  resToJson(res, optionen);
});

app.get("/orte", async (req: Request, res: Response) => {
  const orte = await store.orte();
  resToJson(res, orte);
});

app.post("/orte", [checkOrgateam], async (req: Request, res: Response) => {
  const orte = new Orte(req.body);
  await store.save(orte, req.user as User);
  resToJson(res, orte);
});

app.get("/kalender", [checkOrgateam], async (req: Request, res: Response) => {
  const icals = await store.icals();
  resToJson(res, icals);
});

app.post("/kalender", [checkOrgateam], async (req: Request, res: Response) => {
  const ical = new FerienIcals(req.body);
  await store.save(ical, req.user as User);
  resToJson(res, ical);
});

app.get("/termine", async (req, res) => {
  const termine = await terminstore.alle();
  resToJson(res, termine);
});

app.post("/termine", [checkOrgateam], async (req: Request, res: Response) => {
  const oldTermine = (await terminstore.alle()) as (Termin & { id: string })[];
  const newTermine = misc.toObjectList(Termin, req.body) as (Termin & { id: string })[];
  const { changed, deletedIds } = calculateChangedAndDeleted(
    newTermine.map((t) => t.toJSON()),
    oldTermine.map((t) => t.toJSON()),
  );
  await terminstore.saveAll(changed, req.user as User);
  await terminstore.removeAll(deletedIds, req.user as User);
  resToJson(res, await terminstore.alle());
});
export default app;
