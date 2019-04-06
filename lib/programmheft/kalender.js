const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const misc = beans.get('misc');

function eventsToObject(contents, year) {
  if (!contents) { return {}; }

  function lineToObject(line) {
    function dates(element) {
      function toDate(dayMonthString, plusMillis = 0) {
        const dayMonth = dayMonthString ? dayMonthString.split('.') : [];
        if (dayMonth.length < 2) {
          return null;
        }
        if (!misc.isNumber(dayMonth[0]) || !misc.isNumber(dayMonth[1])) {
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

    const elements = line.split('|');
    if (elements.length < 4) {
      return;
    }
    const was = elements[0];
    const wer = elements[1];
    const farbe = elements[2];
    const fromUntil = dates(elements[3]);
    const email = elements[4] || '';
    const emailOffset = misc.isNumber(elements[5]) ? Number.parseInt(elements[5]) : 7;
    if (was && fromUntil) {
      if (!email) {
        return {
          start: fromUntil[0],
          end: fromUntil[1],
          title: was.trim() + ' (' + wer.trim() + ')',
          color: farbe.trim()
        };
      }
      return {
        start: fromUntil[0],
        end: fromUntil[1],
        title: was.trim() + ' (' + wer.trim() + ')',
        color: farbe.trim(),
        email: email.trim(),
        emailOffset: emailOffset,
        was: was.trim(),
        wer: wer.trim()
      };
    }
  }

  const lines = contents.split(/[\n\r]/);
  return misc.compact(lines.map(lineToObject));
}

class EmailEvent {
  constructor(event) {
    this.event = event;
  }

  momentToSend() {
    const clone = this.start().clone();
    clone.subtract(this.event.emailOffset, 'days');
    return clone;
  }

  start() {
    return moment(this.event.start);
  }

  email() {
    return this.event.email;
  }

  body() {
    return 'Hallo ' + this.event.wer + '\n' +
      'Hier eine automatische Erinnerungsmail, dass Deine Aufgabe "' +
      this.event.was + '" bis zum ' +
      this.start().format('LL') + ' erledigt sein soll.\n\n' +
      'Vielen Dank für Deine Arbeit und Unterstützung,\n' +
      'Der Backoffice-Mailautomat vom Jazzclub';
  }
}

class Kalender {
  constructor(object) {
    if (object && object.id && object.id.split('/').length === 2) {
      const splits = object.id.split('/');
      if (misc.isNumber(splits[0]) && misc.isNumber(splits[1])) {
        this.state = object;
        return;
      }
    }
    this.state = {};
  }

  id() { // JahrMonat als String "YYYY/MM"
    return this.state.id;
  }

  year() {
    return this.state.id && this.state.id.split('/')[0];
  }

  text() {
    return this.state.text || 'Was | Wer | Farbe | Wann | Email | Tage vorher\n' +
      '--- | --- | --- | --- | --- | ---\n';
  }

  setText(text) {
    this.state.text = text;
  }

  asEvents() {
    return eventsToObject(this.text(), this.year());
  }

  eventsToSend(aMoment) {
    const events = eventsToObject(this.text(), this.year())
      .filter(e => !!e.email)
      .map(e => new EmailEvent(e));
    return events.filter(e => e.momentToSend().isSame(aMoment, 'days'));
  }
}

module.exports = Kalender;
