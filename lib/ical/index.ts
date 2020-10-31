import express from "express";
import IcalGenerator, { ICalCalendar } from "ical-generator";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

function icalForVeranstaltungen(veranstaltungen: Veranstaltung[]): ICalCalendar {
  const calendar = IcalGenerator();

  function asICal(veranstaltung: Veranstaltung): void {
    calendar.createEvent({
      uid: veranstaltung.url,
      start: veranstaltung.startDatumUhrzeit().toJSDate,
      end: veranstaltung.endDatumUhrzeit().toJSDate,
      summary: veranstaltung.kopf.titel,
      description: veranstaltung.tooltipInfos(),
      location: veranstaltung.kopf.ort.replace(/\r\n/g, "\n"),
    });
  }
  veranstaltungen.forEach((veranstaltung) => asICal(veranstaltung));
  return calendar;
}

app.get("/", (req, res) => {
  function sendCalendarStringNamedToResult(ical: object, filename: string, res: express.Response): void {
    res.type("text/calendar; charset=utf-8");
    res.header("Content-Disposition", "inline; filename=" + filename + ".ics");
    res.send(ical.toString());
  }

  store.alle((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err || !veranstaltungen) {
      return res.status(500).send(err);
    }
    return sendCalendarStringNamedToResult(icalForVeranstaltungen(veranstaltungen.filter((v) => v.kopf.confirmed)), "events", res);
  });
});

export default app;
