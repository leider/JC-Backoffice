const beans = require('simple-configure').get('beans');
const misc = beans.get('misc');

function contentsToObject(contents, year) {
  if (!contents) { return {}; }

  function dates(element) {
    function toDate(dayMonthString, plusMillis = 0) {
      const dayMonth = dayMonthString ? dayMonthString.split('.') : [];
      if (dayMonth.length < 2) {
        return null;
      }
      return new Date(Date.UTC(year, parseInt(dayMonth[1]) - 1, parseInt(dayMonth[0])) + plusMillis);
    }

    if (element.trim()) {
      const fromAndUntil = misc.compact(element.split('-').map(each => each.trim()));
      const from = toDate(fromAndUntil[0]);
      const until = toDate(fromAndUntil[1] || fromAndUntil[0], 79200000); // 22 hours
      if (from && until) {
        return [from.toISOString(), until.toISOString()];
      }
      return null;
    }
  }

  function lineToObject(line) {
    const elements = line.split('|');
    if (elements.length === 4) {
      const was = elements[0];
      const wer = elements[1];
      const farbe = elements[2];
      const fromUntil = dates(elements[3]);
      if (was && fromUntil) {
        return {
          start: fromUntil[0],
          end: fromUntil[1],
          title: was.trim() + ' (' + wer.trim() + ')',
          color: farbe
        };
      }
    }
  }

  const lines = contents.split(/[\n\r]/);
  return misc.compact(lines.map(lineToObject));
}

module.exports = contentsToObject;
