import async from "async";
import { Response } from "express";
import superagent from "superagent";
import flatMap from "lodash/flatMap";
// @ts-ignore
import icalparser, { CalendarComponent } from "ical";
import { ComplexDate, Parser } from "ikalendar";
import DatumUhrzeit from "../commons/DatumUhrzeit";

import store from "../veranstaltungen/veranstaltungenstore";
import optionenstore from "../optionen/optionenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { expressAppIn } from "../middleware/expressViewHelper";
import FerienIcals, { Ical } from "../optionen/ferienIcals";
import Termin, { TerminEvent } from "../optionen/termin";
import fieldHelpers from "../commons/fieldHelpers";
import { filterUnbestaetigteFuerJedermann } from "../veranstaltungen";
import terminstore from "../optionen/terminstore";

const app = expressAppIn(__dirname);

function eventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, res: Response, callback: Function): void {
  function asCalendarEvent(veranstaltung: Veranstaltung): TerminEvent {
    const urlSuffix = res.locals.accessrights.isOrgaTeam() ? "/allgemeines" : "/preview";

    return {
      start: veranstaltung.startDate.toISOString(),
      end: veranstaltung.endDate.toISOString(),
      url: "/vue" + veranstaltung.fullyQualifiedUrl() + urlSuffix,
      title: veranstaltung.kopf.titel,
      tooltip: veranstaltung.tooltipInfos(),
      className:
        (!veranstaltung.kopf.confirmed ? "color-geplant " : "") +
        "verySmall color-" +
        fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp),
    };
  }

  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return callback(err);
    }
    return callback(null, filterUnbestaetigteFuerJedermann(veranstaltungen, res).map(asCalendarEvent));
  });
}

function termineForIcal(ical: Ical, callback: Function): void {
  function toIsoString(event?: string | ComplexDate): string {
    if (!event) {
      return "";
    }
    if (typeof event === "string") {
      return event;
    }
    return toIsoString((event as ComplexDate).value);
  }

  superagent.get(ical.url, (err: any, resp: superagent.Response) => {
    if (err) {
      return callback(err);
    }
    const parsed = new Parser().parse(resp.text);
    const eventArray: TerminEvent[] =
      parsed.events?.map((event) => ({
        color: ical.color,
        display: "block",
        start: toIsoString(event.start),
        end: toIsoString(event.end || event.start),
        title: event.summary || "",
        tooltip: event.summary || "",
      })) || [];
    return callback(null, eventArray);
  });
}

function termineAsEventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, callback: Function): void {
  terminstore.termineBetween(start, end, (err: Error | null, termine: Termin[]): void => {
    if (err) {
      return callback(err);
    }
    return callback(
      null,
      termine.map((termin) => termin.asEvent)
    );
  });
}

app.get("/events.json", (req, res) => {
  const start = DatumUhrzeit.forISOString(req.query.start as string);
  const end = DatumUhrzeit.forISOString(req.query.end as string);

  async.parallel(
    {
      icals: optionenstore.icals,
      termine: (cb) => termineAsEventsBetween(start, end, (err: Error | null, events: TerminEvent[]) => cb(err, events)),
      veranstaltungen: (cb) => eventsBetween(start, end, res, cb),
    },
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      const icals = (results.icals as FerienIcals).icals;
      async.map(icals, termineForIcal, (err1, termineForIcals?: any[]) => {
        if (err1) {
          res.status(500).send(err);
          return;
        }
        const events = flatMap(termineForIcals, (x) => x)
          .concat(results.termine)
          .concat(results.veranstaltungen);
        return res.set("Content-Type", "application/json").send(events);
      });
    }
  );
});

export default app;
