import misc from '../commons/misc';
import DatumUhrzeit from '../commons/DatumUhrzeit';

function eventsToObject(contents?: string, jahrMonat?: string) {
  if (!contents || !jahrMonat) {
    return [];
  }
  const jmArray = jahrMonat.split('/');

  function lineToObject(line: string) {
    const datum = DatumUhrzeit.forYYYYMM(jmArray[0] + jmArray[1]).minus({
      monate: 2
    });

    function padLeftWithZero(aNumberString: string) {
      return (aNumberString.length === 1 ? '0' : '') + aNumberString;
    }

    function toDate(dayMonthString: string, stunde = '00:00') {
      const dayMonth = dayMonthString ? dayMonthString.split('.') : [];
      if (dayMonth.length < 2) {
        return null;
      }
      if (!misc.isNumber(dayMonth[0]) || !misc.isNumber(dayMonth[1])) {
        return null;
      }
      const day = padLeftWithZero(dayMonth[0]);
      const month = padLeftWithZero(dayMonth[1]);
      const dateString = `${day}.${month}.${datum.jahr}`;
      // @ts-ignore
      return DatumUhrzeit.forGermanString(dateString, stunde).toJSDate;
    }

    function dates(element: string) {
      if (element.trim()) {
        const fromAndUntil = misc.compact(
          element.split('-').map(each => each.trim())
        );
        const from = toDate(fromAndUntil[0]);
        const until = toDate(fromAndUntil[1] || fromAndUntil[0], '22:00'); // 22 hours
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
    const emailOffset = misc.isNumber(elements[5])
      ? Number.parseInt(elements[5])
      : 7;
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

export class EmailEvent {
  private event: any;

  constructor(event: any) {
    this.event = event;
  }

  datumUhrzeitToSend() {
    return this.start().minus({ tage: this.event.emailOffset });
  }

  start() {
    return DatumUhrzeit.forISOString(this.event.start);
  }

  email() {
    return this.event.email;
  }

  body() {
    return `Hallo ${this.event.wer}
Hier eine automatische Erinnerungsmail, dass Deine Aufgabe "${
      this.event.was
    }" bis zum ${this.start().tagMonatJahrLang} erledigt sein soll.

Vielen Dank für Deine Arbeit und Unterstützung,
Der Backoffice-Mailautomat vom Jazzclub`;
  }
}

export default class Kalender {
  state: any;

  constructor(object: any) {
    if (object && object.id && object.id.split('/').length === 2) {
      const splits = object.id.split('/');
      if (misc.isNumber(splits[0]) && misc.isNumber(splits[1])) {
        this.state = object;
        return;
      }
    }
    this.state = {};
  }

  id() {
    // JahrMonat als String "YYYY/MM"
    return this.state.id;
  }

  year() {
    return this.state.id && this.state.id.split('/')[0];
  }

  text() {
    return (
      this.state.text ||
      'Was | Wer | Farbe | Wann | Email | Tage vorher\n' +
        '--- | --- | --- | --- | --- | ---\n'
    );
  }

  setText(text: string) {
    this.state.text = text;
  }

  asEvents() {
    return eventsToObject(this.text(), this.id());
  }

  eventsToSend(aDatumUhrzeit: DatumUhrzeit) {
    const events = eventsToObject(this.text(), this.id())
      .filter(e => !!e.email)
      .map(e => new EmailEvent(e));
    return events.filter(
      e => e.datumUhrzeitToSend().differenzInTagen(aDatumUhrzeit) === 0
    );
  }
}
