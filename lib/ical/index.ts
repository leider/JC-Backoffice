import DatumUhrzeit from "../commons/DatumUhrzeit";
import terminstore from "./terminstore";
import icalService from "./icalService";
import express from "express";
import Termin, { TerminEvent } from "./termin";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { expressAppIn } from "../middleware/expressViewHelper";
import optionenservice from "../optionen/optionenService";
import FerienIcals from "../optionen/ferienIcals";

const app = expressAppIn(__dirname);

app.get("/", (req, res, next) => {
  function sendCalendarStringNamedToResult(ical: object, filename: string, res: express.Response): void {
    res.type("text/calendar; charset=utf-8");
    res.header("Content-Disposition", "inline; filename=" + filename + ".ics");
    res.send(ical.toString());
  }

  store.alle((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err || !veranstaltungen) {
      return next(err);
    }
    return sendCalendarStringNamedToResult(
      icalService.icalForVeranstaltungen(veranstaltungen.filter((v) => v.kopf.confirmed)),
      "events",
      res
    );
  });
});

app.get("/calURLs.json", (req, res) => {
  optionenservice.icals((err: Error, icals: FerienIcals) => {
    if (err) {
      return res.status(500).send(err);
    }
    const result = icals.forCalendar();
    result.unshift("/veranstaltungen/eventsForCalendar");
    result.unshift("/ical/eventsForCalendar");
    res.set("Content-Type", "application/json").send(result);
  });
});

app.get("/termine", (req, res, next) => {
  terminstore.alle((err: Error | null, termine: Termin[]) => {
    if (err) {
      return next(err);
    }
    termine.unshift(new Termin());
    return res.render("termine", { termine });
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

app.get("/eventsForCalendar", (req, res, next) => {
  const start = DatumUhrzeit.forISOString(<string>req.query.start);
  const end = DatumUhrzeit.forISOString(<string>req.query.end);
  icalService.termineAsEventsBetween(start, end, (err: Error | null, events: TerminEvent[]) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    return res.end(JSON.stringify(events));
  });
});

app.get("/eventsFromIcalURL/:url", (req, res, next) => {
  const url = req.params.url;
  icalService.termineFromIcalURL(url, (err: Error | null, events: TerminEvent) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    return res.end(JSON.stringify(events));
  });
});

app.get("/delete/:id", (req, res, next) => {
  terminstore.remove(req.params.id, (err: Error | null) => {
    if (err) {
      return next(err);
    }
    return res.redirect("/ical/termine");
  });
});

app.post("/submit", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  const body = req.body;
  if (body.id) {
    return terminstore.forId(body.id, (err: Error | null, termin: Termin) => {
      if (err || !termin) {
        return next(err);
      }
      termin.fillFromUI(body);
      return terminstore.save(termin, (err1: Error | null) => {
        if (err1) {
          return next(err1);
        }
        return res.redirect("/ical/termine");
      });
    });
  } else {
    const termin = new Termin();
    termin.fillFromUI(body);
    return terminstore.save(termin, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("/ical/termine");
    });
  }
});

export default app;
