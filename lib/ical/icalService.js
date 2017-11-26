const icalendar = require('icalendar');

function asICal(veranstaltung) {
  const event = new icalendar.VEvent(veranstaltung.url());
  event.setSummary(veranstaltung.kopf().titel());
  event.setDescription(veranstaltung.tooltipInfos());
  event.addProperty('LOCATION', veranstaltung.kopf().ort().replace(/\r\n/g, '\n'));
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
