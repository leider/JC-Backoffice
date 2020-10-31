import service from "./optionenService";
import store from "./optionenstore";
import OptionValues from "./optionValues";
import Orte from "./orte";
import FerienIcals from "./ferienIcals";
import { expressAppIn } from "../middleware/expressViewHelper";
import { NextFunction, Request, Response } from "express";
import Termin from "./termin";
import terminstore from "./terminstore";

const app = expressAppIn(__dirname);

app.get("/optionen.json", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.optionen((err: Error | null, optionen: OptionValues) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.set("Content-Type", "application/json").send(optionen.toJSON());
  });
});

app.post("/saveOptionen", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam) {
    return res.redirect("/"); //ErrorHandling!!
  }
  const optionen = new OptionValues(req.body);
  store.save(optionen, (err: Error | null) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(optionen.toJSON());
  });
});

app.get("/orte.json", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.orte((err: Error | null, orte: Orte) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.set("Content-Type", "application/json").send(orte);
  });
});

app.post("/saveOrte", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam) {
    return res.redirect("/"); //ErrorHandling!!
  }
  const orte = new Orte(req.body);
  store.save(orte, (err: Error | null) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(orte.toJSON());
  });
});

app.get("/kalender.json", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return store.icals((err: Error | null, icals: FerienIcals) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.set("Content-Type", "application/json").send(icals.toJSON());
  });
});

app.post("/savekalender", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  const ical = new FerienIcals(req.body);
  store.save(ical, (err: Error | null) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(ical.toJSON());
  });
});

app.get("/termine.json", (req, res, next) => {
  terminstore.alle((err: Error | null, termine: Termin[]) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.set("Content-Type", "application/json").send(termine);
  });
});

app.post("/savetermin", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/"); //ErrorHandling!!
  }
  const termin = new Termin(req.body);
  delete termin.originalBeschreibung;
  terminstore.save(termin, (err: Error | null) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(termin.toJSON());
  });
});

app.post("/deletetermin", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/"); //ErrorHandling!!
  }
  const id = req.body.id;
  terminstore.remove(id, (err: Error | null) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send({ message: "Termin gelöscht" });
  });
});

export default app;
