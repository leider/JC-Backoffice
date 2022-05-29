import async from "async";
import express from "express";
import superagent from "superagent";
import flatMap from "lodash/flatMap";
import { ComplexDate, Parser } from "ikalendar";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals";
import Termin, { TerminEvent } from "jc-shared/optionen/termin";
import User from "jc-shared/user/user";
import fieldHelpers from "jc-shared/commons/fieldHelpers";

import store from "../lib/veranstaltungen/veranstaltungenstore";
import optionenstore from "../lib/optionen/optionenstore";
import terminstore from "../lib/optionen/terminstore";
import { reply } from "../lib/commons/replies";
import veranstaltungenService from "../lib/veranstaltungen/veranstaltungenService";

const app = express();

function eventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, user: User | undefined, callback: Function): void {
  function asCalendarEvent(veranstaltung: Veranstaltung): TerminEvent {
    const urlSuffix = user?.accessrights?.isOrgaTeam ? "/allgemeines" : "/preview";

    return {
      start: veranstaltung.startDate.toISOString(),
      end: veranstaltung.endDate.toISOString(),
      url: "/vue" + veranstaltung.fullyQualifiedUrl + urlSuffix,
      title: veranstaltung.kopf.titelMitPrefix,
      tooltip: veranstaltung.tooltipInfos,
      className:
        (!veranstaltung.kopf.confirmed ? "color-geplant " : "") +
        "verySmall color-" +
        fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp),
    };
  }

  store.byDateRangeInAscendingOrder(start, end, (err?: Error, veranstaltungen?: Veranstaltung[]) => {
    if (err) {
      return callback(err);
    }
    return callback(undefined, veranstaltungenService.filterUnbestaetigteFuerJedermann(veranstaltungen || [], user).map(asCalendarEvent));
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

  superagent.get(ical.url, (err?: Error, resp?: superagent.Response) => {
    if (err) {
      return callback(err);
    }
    const parsed = new Parser().parse(resp?.text || "");
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
  terminstore.termineBetween(start, end, (err?: Error, termine?: Termin[]): void => {
    if (err) {
      return callback(err);
    }
    return callback(
      undefined,
      termine?.map((termin) => termin.asEvent)
    );
  });
}

app.get("/fullcalendarevents.json", (req, res) => {
  const start = DatumUhrzeit.forISOString(req.query.start as string);
  const end = DatumUhrzeit.forISOString(req.query.end as string);

  async.parallel<TerminEvent[] | FerienIcals>(
    {
      icals: async (cb) => {
        try {
          const res = await optionenstore.icals();
          return cb(null, res);
        } catch (e) {
          return cb(e as Error);
        }
      },
      termine: (cb) => termineAsEventsBetween(start, end, (err: Error | null, events: TerminEvent[]) => cb(err, events)),
      veranstaltungen: (cb) => eventsBetween(start, end, req.user as User, cb),
    },
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      const icals = (results.icals as FerienIcals).icals;
      async.map<Ical, TerminEvent>(icals, termineForIcal, (err1, termineForIcals?) => {
        const events = flatMap(termineForIcals, (x) => x)
          .concat(results.termine as TerminEvent[])
          .concat(results.veranstaltungen as TerminEvent[]);
        reply(res, err1, events);
      });
    }
  );
});

export default app;
