import async from "async";
import { Response } from "express";
import superagent from "superagent";
import flatMap from "lodash/flatMap";

import DatumUhrzeit from "../commons/DatumUhrzeit";

import store from "../veranstaltungen/veranstaltungenstore";
import optionenstore from "../optionen/optionenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import { expressAppIn } from "../middleware/expressViewHelper";
import FerienIcals, { Ical } from "../optionen/ferienIcals";
import Termin, { TerminEvent } from "../ical/termin";
import fieldHelpers from "../commons/fieldHelpers";
import { filterUnbestaetigteFuerJedermann } from "../veranstaltungen";
import terminstore from "../ical/terminstore";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const icalendar = require("icalendar");

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
  superagent.get(ical.url, (err: any, resp: superagent.Response) => {
    if (err) {
      return callback(err);
    }
    // HACK for feeds not ending with \r\n
    let body = resp.text;
    const lines = body.split(/\r?\n/);
    if (lines[lines.length - 1] !== "") {
      body = body + "\r\n";
    }
    // END HACK

    const events: TerminEvent = icalendar
      .parse_calendar(body)
      .events()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((each: any) => {
        const calprops = each.properties;
        return {
          color: ical.color,
          display: "block",
          start: calprops.DTSTART[0].value.toISOString(),
          end: calprops.DTEND ? calprops.DTEND[0].value.toISOString() : calprops.DTSTART[0].value.toISOString(),
          title: calprops.SUMMARY[0].value,
          tooltip: calprops.SUMMARY[0].value,
        };
      });
    return callback(null, events);
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
      async.map(icals, termineForIcal, (err1, result2?: any[]) => {
        if (err1) {
          res.status(500).send(err);
          return;
        }
        const events = flatMap(result2, (x) => x)
          .concat(results.termine)
          .concat(results.veranstaltungen);
        return res.set("Content-Type", "application/json").send(events);
      });
    }
  );
});

export default app;
