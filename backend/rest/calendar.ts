import express from "express";
import { Dictionary } from "lodash";
import superagent from "superagent";
import groupBy from "lodash/groupBy.js";
import flatMap from "lodash/flatMap.js";
import { ComplexDate, Parser } from "ikalendar";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals.js";
import { TerminEvent, TerminFilterOptions } from "jc-shared/optionen/termin.js";
import User from "jc-shared/user/user.js";

import store from "../lib/veranstaltungen/veranstaltungenstore.js";
import optionenstore from "../lib/optionen/optionenstore.js";
import terminstore from "../lib/optionen/terminstore.js";
import vermietungenstore from "../lib/vermietungen/vermietungenstore.js";
import { resToJson } from "../lib/commons/replies.js";
import veranstaltungenService from "../lib/veranstaltungen/veranstaltungenService.js";
import vermietungenService from "../lib/vermietungen/vermietungenService.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import { TypMitMehr } from "jc-shared/optionen/optionValues.js";

const app = express();

async function eventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, user: User) {
  function asCalendarEvent(veranstaltung: Veranstaltung, typByName: Dictionary<TypMitMehr[]>): TerminEvent {
    const color = typByName[veranstaltung.kopf.eventTyp]?.[0].color || "#6c757d";
    return {
      display: "block",
      start: veranstaltung.startDate.toISOString(),
      end: veranstaltung.endDate.toISOString(),
      url: `/vue/veranstaltung/${user.accessrights.isOrgaTeam ? "" : "preview/"}${encodeURIComponent(veranstaltung.url || "")}`,
      title: veranstaltung.kopf.titelMitPrefix,
      tooltip: veranstaltung.tooltipInfos,
      backgroundColor: color,
      textColor: "#fff",
      borderColor: !veranstaltung.kopf.confirmed ? "#f8500d" : color,
      className: "no-overflow",
    };
  }
  const optionen = await optionenstore.get();
  const typByName = groupBy(optionen?.typenPlus || [], "name");

  const veranstaltungen = await store.byDateRangeInAscendingOrder(start, end);
  const unbest = await veranstaltungenService.filterUnbestaetigteFuerJedermann(veranstaltungen, user);
  return unbest.map((ver) => asCalendarEvent(ver, typByName));
}

async function vermietungenBetween(start: DatumUhrzeit, end: DatumUhrzeit, user: User) {
  function asCalendarEvent(vermietung: Vermietung): TerminEvent {
    return {
      display: "block",
      start: vermietung.startDate.toISOString(),
      end: vermietung.endDate.toISOString(),
      url: user.accessrights.isOrgaTeam ? `/vue/vermietung/${encodeURIComponent(vermietung.url || "")}` : "",
      title: vermietung.kopf.titel,
      tooltip: "",
      backgroundColor: "#f6eee1",
      textColor: "#111",
      borderColor: !vermietung.kopf.confirmed ? "#f8500d" : "#f6eee1",
      className: "no-overflow",
    };
  }

  const vermietungen = await vermietungenstore.byDateRangeInAscendingOrder(start, end);
  return vermietungenService.filterUnbestaetigteFuerJedermann(vermietungen, user).map(asCalendarEvent);
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
      backgroundColor: ical.color,
      borderColor: ical.color,
      display: "block",
      start: toIsoString(event.start),
      end: toIsoString(event.end || event.start),
      title: event.summary || "",
      tooltip: event.summary || "",
      className: "no-overflow",
    })) || [];
  return eventArray;
}

async function termineAsEventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, options?: TerminFilterOptions) {
  const termine = await terminstore.termineBetween(start, end);
  let filteredTermine = termine;
  if (options) {
    filteredTermine = termine.filter((termin) => options.termine?.includes(termin.typ));
  }
  return filteredTermine?.map((termin) => termin.asEvent);
}

app.get("/fullcalendarevents.json", async (req, res) => {
  const start = DatumUhrzeit.forISOString(req.query.start as string);
  const end = DatumUhrzeit.forISOString(req.query.end as string);
  const options: TerminFilterOptions | undefined = req.query.options
    ? (JSON.parse(req.query.options as string) as unknown as TerminFilterOptions)
    : undefined;

  const [cals, termine, veranstaltungen, vermietungen] = await Promise.all([
    optionenstore.icals(),
    termineAsEventsBetween(start, end, options),
    eventsBetween(start, end, req.user as User),
    vermietungenBetween(start, end, req.user as User),
  ]);

  const icals =
    (cals as FerienIcals)?.icals.filter((ical) => {
      if (!options) {
        return true;
      }
      return options.icals?.includes(ical.typ);
    }) || [];

  const termineForIcals = await Promise.all(icals.map(termineForIcal));
  const events = flatMap(termineForIcals, (x) => x)
    .concat(termine as TerminEvent[])
    .concat(veranstaltungen as TerminEvent[])
    .concat(vermietungen as TerminEvent[]);
  resToJson(res, events);
});

export default app;
