import service from "./optionenService";
import store from "./optionenstore";
import DatumUhrzeit from "../commons/DatumUhrzeit";
import OptionValues from "./optionValues";
import Orte from "./orte";
import FerienIcals from "./ferienIcals";
import { expressAppIn } from "../middleware/expressViewHelper";
import { NextFunction, Request, Response } from "express";
import Termin from "../ical/termin";
import terminstore from "../ical/terminstore";

const app = expressAppIn(__dirname);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.optionen((err: Error | null, optionen: OptionValues) => {
    if (err) {
      return next(err);
    }
    return res.render("optionen", { optionen: optionen });
  });
});

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

app.get("/orte", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.orte((err: Error | null, orte: Orte) => {
    if (err) {
      return next(err);
    }
    return res.render("orte", { orte });
  });
});

app.get("/icals", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return service.icals((err: Error | null, icals: FerienIcals) => {
    if (err) {
      return next(err);
    }
    return res.render("icals", { icals: icals || {} });
  });
});

app.post("/ortChanged", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  const ort = req.body;
  // eslint-disable-next-line no-underscore-dangle
  delete ort._csrf;
  return service.orte((err: Error | null, orte: Orte) => {
    if (err) {
      return next(err);
    }
    if (ort.name) {
      if (ort.oldname) {
        //ändern
        orte.updateOrt(ort.oldname, ort);
      } else {
        //neu
        orte.addOrt(ort);
      }
    } else {
      //löschen
      orte.deleteOrt(ort.oldname);
    }
    return store.save(orte, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("orte");
    });
  });
});

app.post("/icalChanged", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  const ical = req.body;
  // eslint-disable-next-line no-underscore-dangle
  delete ical._csrf;
  return service.icals((err: Error | null, icals: FerienIcals) => {
    if (err) {
      return next(err);
    }
    if (ical.name) {
      if (ical.oldname) {
        //ändern
        icals.updateIcal(ical.oldname, ical);
      } else {
        //neu
        icals.addIcal(ical);
      }
    } else {
      //löschen
      icals.deleteIcal(ical.oldname);
    }
    return store.save(icals, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("icals");
    });
  });
});

app.post("/savetermin", (req: Request, res: Response) => {
  if (!res.locals.accessrights.isBookingTeam()) {
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
  if (!res.locals.accessrights.isBookingTeam()) {
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

app.post("/submit", (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  return service.optionen((err: Error | null, optionen: OptionValues) => {
    if (err) {
      return next(err);
    }
    optionen.fillFromUI(req.body);
    return store.save(optionen, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("/");
    });
  });
});

export default app;
