import express from "express";
import superagent from "superagent";
import flatMap from "lodash/flatMap";
import { ComplexDate, Parser } from "ikalendar";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals";
import { TerminEvent } from "jc-shared/optionen/termin";
import User from "jc-shared/user/user";
import fieldHelpers from "jc-shared/commons/fieldHelpers";

import store from "../lib/veranstaltungen/veranstaltungenstore";
import optionenstore from "../lib/optionen/optionenstore";
import terminstore from "../lib/optionen/terminstore";
import { resToJson } from "../lib/commons/replies";
import veranstaltungenService from "../lib/veranstaltungen/veranstaltungenService";

const app = express();

async function eventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, user?: User) {
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

  const veranstaltungen = await store.byDateRangeInAscendingOrder(start, end);
  return veranstaltungenService.filterUnbestaetigteFuerJedermann(veranstaltungen || [], user).map(asCalendarEvent);
}

async function termineForIcal(ical: Ical) {
  function toIsoString(event?: string | ComplexDate): string {
    if (!event) {
      return "";
    }
    if (typeof event === "string") {
      return event;
    }
    return toIsoString((event as ComplexDate).value);
  }

  const resp = await superagent.get(ical.url);
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
  return eventArray;
}

async function termineAsEventsBetween(start: DatumUhrzeit, end: DatumUhrzeit) {
  const termine = await terminstore.termineBetween(start, end);
  return termine?.map((termin) => termin.asEvent);
}

app.get("/fullcalendarevents.json", async (req, res) => {
  const start = DatumUhrzeit.forISOString(req.query.start as string);
  const end = DatumUhrzeit.forISOString(req.query.end as string);

  const [cals, termine, veranstaltungen] = await Promise.all([
    optionenstore.icals(),
    termineAsEventsBetween(start, end),
    eventsBetween(start, end, req.user as User),
  ]);
  const icals = (cals as FerienIcals).icals;

  const termineForIcals = await Promise.all(icals.map(termineForIcal));
  const events = flatMap(termineForIcals, (x) => x)
    .concat(termine as TerminEvent[])
    .concat(veranstaltungen as TerminEvent[]);
  resToJson(res, events);
});

export default app;
