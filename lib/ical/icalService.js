const icalendar = require('icalendar');
const request = require('request').defaults({jar: true});

const conf = require('simple-configure');
const beans = conf.get('beans');
const terminstore = beans.get('terminstore');

function asICal(veranstaltung) {
  const event = new icalendar.VEvent(veranstaltung.url());
  event.setSummary(veranstaltung.kopf().titel());
  event.setDescription(veranstaltung.tooltipInfos());
  event.addProperty('LOCATION', veranstaltung.kopf().ort().replace(/\r\n/g, '\n'));
  event.setDate(veranstaltung.startMoment().toDate(), veranstaltung.endMoment().toDate());
  return event;
}

function termineFromIcalURL(url, callback) {
  request(url, (err, resp, body) => {
    if (err) { return callback(err); }
    // HACK for feeds not ending with \r\n
    const lines = body.split(/\r?\n/);
    if (lines[lines.length - 1] !== '') {
      body = body + '\r\n';
    }
    // END HACK

    const events = icalendar.parse_calendar(body).events().map(each => {
      return {
        start: each.properties.DTSTART[0].value.toISOString(),
        end: each.properties.DTEND ? each.properties.DTEND[0].value.toISOString() : each.properties.DTSTART[0].value.toISOString(),
        title: each.properties.SUMMARY[0].value,
        tooltip: each.properties.SUMMARY[0].value
      };
    });
    callback(null, events);
  });
}

function termineAsEventsBetween(startMoment, endMoment, callback) {
  terminstore.termineBetween(startMoment, endMoment, (err2, termine) => {
    if (err2) { return callback(err2); }
    const terminEvents = termine.map(termin => termin.asEvent());
    callback(null, terminEvents);
  });
}

module.exports = {
  asICal,

  icalForVeranstaltungen: function (veranstaltungen) {
    /* eslint new-cap: 0 */
    const ical = new icalendar.iCalendar();
    veranstaltungen.forEach(veranstaltung => ical.addComponent(asICal(veranstaltung)));
    return ical;
  },

  termineFromIcalURL,
  termineAsEventsBetween
};
