/* eslint-disable @typescript-eslint/no-explicit-any */
import DatumUhrzeit from "../commons/DatumUhrzeit";
import superagent, { Response } from "superagent";
import Termin, { TerminEvent } from "./termin";
import terminstore from "./terminstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const icalendar = require("icalendar");

function asICal(veranstaltung: Veranstaltung): object {
  const event = new icalendar.VEvent(veranstaltung.url);
  event.setSummary(veranstaltung.kopf.titel);
  event.setDescription(veranstaltung.tooltipInfos());
  event.addProperty("LOCATION", veranstaltung.kopf.ort.replace(/\r\n/g, "\n"));
  event.setDate(veranstaltung.startDatumUhrzeit().toJSDate, veranstaltung.endDatumUhrzeit().toJSDate);
  return event;
}

function termineFromIcalURL(url: string, callback: Function): void {
  superagent.get(url, (err: any, resp: Response) => {
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
  terminstore.termineBetween(start, end, (err2: Error | null, termine: Termin[]): void => {
    if (err2) {
      return callback(err2);
    }
    return callback(
      null,
      termine.map((termin) => termin.asEvent())
    );
  });
}

export default {
  asICal,

  icalForVeranstaltungen: function (veranstaltungen: Veranstaltung[]): object {
    // eslint-disable-next-line new-cap
    const ical = new icalendar.iCalendar();
    veranstaltungen.forEach((veranstaltung) => ical.addComponent(asICal(veranstaltung)));
    return ical;
  },

  termineFromIcalURL,
  termineAsEventsBetween,
};
