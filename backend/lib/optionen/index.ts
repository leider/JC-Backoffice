import service from "./optionenService";
import store from "./optionenstore";
import OptionValues from "./optionValues";
import Orte from "./orte";
import FerienIcals from "./ferienIcals";
import { expressAppIn } from "../middleware/expressViewHelper";
import { NextFunction, Request, Response } from "express";
import Termin from "./termin";
import terminstore from "./terminstore";
import { reply } from "../commons/replies";

const app = expressAppIn(__dirname);

app.get("/optionen.json", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  return service.optionen((err?: Error, optionen?: OptionValues) => {
    reply(res, err, optionen);
  });
});

app.post("/saveOptionen", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const optionen = new OptionValues(req.body);
  store.save(optionen, (err?: Error) => {
    reply(res, err, optionen);
  });
});

app.get("/orte.json", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  return service.orte((err?: Error, orte?: Orte) => {
    reply(res, err, orte);
  });
});

app.post("/saveOrte", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const orte = new Orte(req.body);
  store.save(orte, (err?: Error) => {
    reply(res, err, orte);
  });
});

app.get("/kalender.json", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }

  return store.icals((err?: Error, icals?: FerienIcals) => {
    reply(res, err, icals);
  });
});

app.post("/savekalender", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const ical = new FerienIcals(req.body);
  store.save(ical, (err?: Error) => {
    reply(res, err, ical);
  });
});

app.get("/termine.json", (req, res) => {
  terminstore.alle((err?: Error, termine?: Termin[]) => {
    reply(res, err, termine);
  });
});

app.post("/savetermin", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const termin = new Termin(req.body);
  delete termin.originalBeschreibung;
  terminstore.save(termin, (err: Error | null) => {
    reply(res, err, termin);
  });
});

app.post("/deletetermin", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.sendStatus(403);
  }
  const id = req.body.id;
  terminstore.remove(id, (err: Error | null) => {
    reply(res, err);
  });
});

export default app;
