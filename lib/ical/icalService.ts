import DatumUhrzeit from '../commons/DatumUhrzeit';
import req, { Response } from 'request';
import Termin, { TerminEvent } from './termin';
import terminstore from './terminstore';
import Veranstaltung from '../veranstaltungen/object/veranstaltung';

const icalendar = require('icalendar');

const request = req.defaults({ jar: true });

function asICal(veranstaltung: Veranstaltung) {
  const event = new icalendar.VEvent(veranstaltung.url());
  event.setSummary(veranstaltung.kopf().titel());
  event.setDescription(veranstaltung.tooltipInfos());
  event.addProperty(
    'LOCATION',
    veranstaltung
      .kopf()
      .ort()
      .replace(/\r\n/g, '\n')
  );
  event.setDate(
    veranstaltung.startDatumUhrzeit().toJSDate,
    veranstaltung.endDatumUhrzeit().toJSDate
  );
  return event;
}

function termineFromIcalURL(url: string, callback: Function) {
  request(url, (err: Error | null, resp: Response, body: any) => {
    if (err) {
      return callback(err);
    }
    // HACK for feeds not ending with \r\n
    const lines = body.split(/\r?\n/);
    if (lines[lines.length - 1] !== '') {
      body = body + '\r\n';
    }
    // END HACK

    const events: TerminEvent = icalendar
      .parse_calendar(body)
      .events()
      .map((each: any) => {
        const calprops = each.properties;
        return {
          start: calprops.DTSTART[0].value.toISOString(),
          end: calprops.DTEND
            ? calprops.DTEND[0].value.toISOString()
            : calprops.DTSTART[0].value.toISOString(),
          title: calprops.SUMMARY[0].value,
          tooltip: calprops.SUMMARY[0].value
        };
      });
    callback(null, events);
  });
}

function termineAsEventsBetween(
  start: DatumUhrzeit,
  end: DatumUhrzeit,
  callback: Function
) {
  terminstore.termineBetween(
    start,
    end,
    (err2: Error | null, termine: Termin[]) => {
      if (err2) {
        return callback(err2);
      }
      callback(
        null,
        termine.map(termin => termin.asEvent())
      );
    }
  );
}

export default {
  asICal,

  icalForVeranstaltungen: function(veranstaltungen: Veranstaltung[]) {
    const ical = new icalendar.iCalendar();
    veranstaltungen.forEach(veranstaltung =>
      ical.addComponent(asICal(veranstaltung))
    );
    return ical;
  },

  termineFromIcalURL,
  termineAsEventsBetween
};
