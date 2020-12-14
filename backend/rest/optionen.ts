import store from "../lib/optionen/optionenstore";
import OptionValues from "../../shared/optionen/optionValues";
import Orte from "../../shared/optionen/orte";
import FerienIcals from "../../shared/optionen/ferienIcals";
import express, { Request, Response } from "express";
import Termin from "../../shared/optionen/termin";
import terminstore from "../lib/optionen/terminstore";
import { reply } from "../lib/commons/replies";

const app = express();

app.get("/optionen", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  return store.get((err?: Error, optionen?: OptionValues) => {
    reply(res, err, optionen);
  });
});

app.post("/optionen", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const optionen = new OptionValues(req.body);
  store.save(optionen, (err?: Error) => {
    reply(res, err, optionen);
  });
});

app.get("/orte", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  return store.orte((err?: Error, orte?: Orte) => {
    reply(res, err, orte);
  });
});

app.post("/orte", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const orte = new Orte(req.body);
  store.save(orte, (err?: Error) => {
    reply(res, err, orte);
  });
});

app.get("/kalender", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  return store.icals((err?: Error, icals?: FerienIcals) => {
    reply(res, err, icals);
  });
});

app.post("/kalender", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const ical = new FerienIcals(req.body);
  store.save(ical, (err?: Error) => {
    reply(res, err, ical);
  });
});

app.get("/termine", (req, res) => {
  terminstore.alle((err?: Error, termine?: Termin[]) => {
    reply(res, err, termine);
  });
});

app.post("/termin", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const termin = new Termin(req.body);
  delete termin.originalBeschreibung;
  terminstore.save(termin, (err: Error | null) => {
    reply(res, err, termin);
  });
});

app.delete("/termin", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const id = req.body.id;
  terminstore.remove(id, (err: Error | null) => {
    reply(res, err);
  });
});

export default app;