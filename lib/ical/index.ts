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

app.get("/eventsForCalendar", (req, res, next) => {
  const start = DatumUhrzeit.forISOString(<string>req.query.start);
  const end = DatumUhrzeit.forISOString(<string>req.query.end);
  icalService.termineAsEventsBetween(start, end, (err: Error | null, events: TerminEvent[]) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    return res.set("Content-Type", "application/json").send(events);
  });
});

app.get("/eventsFromIcalURL/:url", (req, res, next) => {
  const url = req.params.url;
  icalService.termineFromIcalURL(url, (err: Error | null, events: TerminEvent) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    return res.set("Content-Type", "application/json").send(events);
  });
});

export default app;
