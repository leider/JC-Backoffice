const icalendar = require('icalendar');

const beans = require('simple-configure').get('beans');
const misc = beans.get('misc');

function asICal(veranstaltung) {
  const event = new icalendar.VEvent(veranstaltung.url());
  event.setSummary(veranstaltung.kopf().titel());
  event.setDescription(veranstaltung.staff().tooltipInfos());
  event.addProperty('LOCATION', veranstaltung.kopf().ort().replace(/\r\n/g, '\n'));
  event.addProperty('URL', misc.toFullQualifiedUrl('veranstaltungen', encodeURIComponent(veranstaltung.url())));
  event.setDate(veranstaltung.startMoment().toDate(), veranstaltung.endMoment().toDate());
  return event;
}

module.exports = {
  asICal,

  icalForVeranstaltungen: function (veranstaltungen) {
    /* eslint new-cap: 0 */
    const ical = new icalendar.iCalendar();
    veranstaltungen.forEach(veranstaltung => ical.addComponent(asICal(veranstaltung)));
    return ical;
  }
};