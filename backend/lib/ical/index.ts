import express from "express";
import { Builder, Calendar, Event } from "ikalendar";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

function icalForVeranstaltungen(veranstaltungen: Veranstaltung[]): string {
  const events: Event[] = [];

  const calendar: Calendar = {
    version: "2.0",
    prodId: "ical by jazzclub",
    events: events,
  };

  function asICal(veranstaltung: Veranstaltung): void {
    events.push({
      uid: veranstaltung.url || "",
      start: veranstaltung.startDatumUhrzeit().fuerIcal,
      end: veranstaltung.endDatumUhrzeit().fuerIcal,
      summary: veranstaltung.kopf.titel,
      description: veranstaltung.tooltipInfos(),
      location: veranstaltung.kopf.ort.replace(/\r\n/g, "\n"),
    });
  }
  veranstaltungen.forEach((veranstaltung) => asICal(veranstaltung));
  const builder = new Builder(calendar);
  return builder.build();
}

app.get("/", (req, res) => {
  function sendCalendarStringNamedToResult(icalString: string, filename: string, res: express.Response): void {
    res.type("ics");
    res.header("Content-Disposition", "inline; filename=" + filename + ".ics");
    res.send(icalString);
  }

  store.alle((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err || !veranstaltungen) {
      return res.status(500).send(err);
    }
    return sendCalendarStringNamedToResult(icalForVeranstaltungen(veranstaltungen.filter((v) => v.kopf.confirmed)), "events", res);
  });
});

export default app;
