import DatumUhrzeit from '../commons/DatumUhrzeit';

const icalendar = require('icalendar');
import req, { Response } from 'request';
import Termin from './termin';

const request = req.defaults({ jar: true });

import terminstore from './terminstore';

function asICal(veranstaltung: any) {
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
    veranstaltung.startDatumUhrzeit().toJSDate(),
    veranstaltung.endDatumUhrzeit().toJSDate()
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

    const events = icalendar
      .parse_calendar(body)
      .events()
      .map((each: any) => {
        return {
          start: each.properties.DTSTART[0].value.toISOString(),
          end: each.properties.DTEND
            ? each.properties.DTEND[0].value.toISOString()
            : each.properties.DTSTART[0].value.toISOString(),
          title: each.properties.SUMMARY[0].value,
          tooltip: each.properties.SUMMARY[0].value
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
      const terminEvents = termine.map(termin => termin.asEvent());
      callback(null, terminEvents);
    }
  );
}

export default {
  asICal,

  icalForVeranstaltungen: function(veranstaltungen: any) {
    /* eslint new-cap: 0 */
    const ical = new icalendar.iCalendar();
    veranstaltungen.forEach((veranstaltung: any) =>
      ical.addComponent(asICal(veranstaltung))
    );
    return ical;
  },

  termineFromIcalURL,
  termineAsEventsBetween
};
