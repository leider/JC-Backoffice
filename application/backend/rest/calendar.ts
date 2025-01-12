import express from "express";
import groupBy from "lodash/groupBy.js";
import flatMap from "lodash/flatMap.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import { Ical } from "jc-shared/optionen/ferienIcals.js";
import { TerminFilterOptions } from "jc-shared/optionen/termin.js";
import User from "jc-shared/user/user.js";

import store from "../lib/konzerte/konzertestore.js";
import optionenstore from "../lib/optionen/optionenstore.js";
import terminstore from "../lib/optionen/terminstore.js";
import vermietungenstore from "../lib/vermietungen/vermietungenstore.js";
import { resToJson } from "../lib/commons/replies.js";
import konzerteService from "../lib/konzerte/konzerteService.js";
import vermietungenService from "../lib/vermietungen/vermietungenService.js";
import { icalToTerminEvents, parseIcal } from "jc-shared/commons/iCalendarUtils.js";
import kalenderEventsService from "../lib/optionen/kalenderEventsService.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import { colorDefault, colorVermietung, TypMitMehr } from "jc-shared/optionen/optionValues.js";
import map from "lodash/map.js";

const app = express();

function asCalendarEvent(veranstaltung: Veranstaltung, user: User, typByName: { [key: string]: TypMitMehr[] }) {
  const color = veranstaltung.isVermietung ? colorVermietung : (typByName[veranstaltung.kopf.eventTyp]?.[0].color ?? colorDefault);
  return veranstaltung.asCalendarEvent(user.accessrights.isOrgaTeam, color);
}

function eventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, user: User) {
  const optionen = optionenstore.get();
  const typByName = groupBy(optionen?.typenPlus || [], "name");

  const konzerte = store.byDateRangeInAscendingOrder(start, end);
  const unbest = konzerteService.filterUnbestaetigteFuerJedermann(konzerte, user);
  return map(unbest, (ver) => asCalendarEvent(ver, user, typByName));
}

function vermietungenBetween(start: DatumUhrzeit, end: DatumUhrzeit, user: User) {
  const vermietungen = vermietungenstore.byDateRangeInAscendingOrder(start, end);
  return map(vermietungenService.filterUnbestaetigteFuerJedermann(vermietungen, user), (ver) => asCalendarEvent(ver, user, {}));
}

async function termineForIcal(ical: Ical) {
  const result = await kalenderEventsService.retrieveEvents(ical);
  return result ? icalToTerminEvents(parseIcal(result)) : [];
}

function termineAsEventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, options?: TerminFilterOptions) {
  const termine = terminstore.termineBetween(start, end);
  let filteredTermine = termine;
  if (options) {
    filteredTermine = termine.filter((termin) => options.termine?.includes(termin.typ));
  }
  return map(filteredTermine, "asEvent");
}

app.get("/fullcalendarevents.json", async (req, res) => {
  const start = DatumUhrzeit.forISOString(req.query.start as string);
  const end = DatumUhrzeit.forISOString(req.query.end as string);
  const options: TerminFilterOptions | undefined = req.query.options
    ? (JSON.parse(req.query.options as string) as unknown as TerminFilterOptions)
    : undefined;

  const cals = optionenstore.icals();
  const termine = termineAsEventsBetween(start, end, options);
  const konzerte = eventsBetween(start, end, req.user as User);
  const vermietungen = vermietungenBetween(start, end, req.user as User);

  const icals =
    cals?.icals.filter((ical) => {
      if (!options) {
        return true;
      }
      return options.icals?.includes(ical.typ);
    }) || [];

  const termineForIcals = await Promise.all(map(icals, termineForIcal));
  const events = termine
    .concat(flatMap(termineForIcals, (x) => x))
    .concat(konzerte)
    .concat(vermietungen);
  resToJson(res, events);
});

export default app;
