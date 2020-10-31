import express from "express";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const icalendar = require("icalendar");

function icalForVeranstaltungen(veranstaltungen: Veranstaltung[]): object {
  function asICal(veranstaltung: Veranstaltung): object {
    const event = new icalendar.VEvent(veranstaltung.url);
    event.setSummary(veranstaltung.kopf.titel);
    event.setDescription(veranstaltung.tooltipInfos());
    event.addProperty("LOCATION", veranstaltung.kopf.ort.replace(/\r\n/g, "\n"));
    event.setDate(veranstaltung.startDatumUhrzeit().toJSDate, veranstaltung.endDatumUhrzeit().toJSDate);
    return event;
  }

  // eslint-disable-next-line new-cap
  const ical = new icalendar.iCalendar();
  veranstaltungen.forEach((veranstaltung) => ical.addComponent(asICal(veranstaltung)));
  return ical;
}

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
    return sendCalendarStringNamedToResult(icalForVeranstaltungen(veranstaltungen.filter((v) => v.kopf.confirmed)), "events", res);
  });
});

export default app;
