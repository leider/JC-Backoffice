import misc from "../commons/misc.js";
import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import { Event } from "./Event.js";

function eventsToObject(contents?: string): Event[] {
  if (!contents) {
    return [];
  }

  const lines = contents.replaceAll("\\", "").split(/[\n\r]/);
  return misc.compact(lines.map(Event.fromLine)) as Event[];
}

export class EmailEvent {
  event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  private datumUhrzeitToSend(): DatumUhrzeit {
    return this.start().minus({ tage: this.event.emailOffset });
  }

  shouldSendOn(datumUhrzeit: DatumUhrzeit): boolean {
    return Math.abs(this.datumUhrzeitToSend().differenzInTagen(datumUhrzeit)) === 0;
  }

  start(): DatumUhrzeit {
    return DatumUhrzeit.forISOString(this.event.start);
  }

  email() {
    return (this.event.email ?? "").split(/[, ]+/).map((each) => each.trim());
  }

  body(): string {
    return `${this.event.wer},

hier eine automatische Erinnerungsmail:
${this.event.was}

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum ${this.start().tagMonatJahrLang} erledigt sein.

Danke & keep swingin'`;
  }
}

function cleanTextAsCorrectTable(text: string) {
  return text.replace(/\n\n/g, "\n");
}

function eventsToText(events: Event[]): string {
  const strings = events.map((event) => event.asTextLine);
  return [
    `Was | Wer | Farbe | Wann | Email | Tage vorher
--- | --- | --- | --- | --- | ---`,
    ...strings,
  ].join("\n");
}

export default class Kalender {
  id: string;
  text = "";

  constructor(object?: { id: string; text: string }) {
    if (object && object.id && object.id.split("/").length === 2) {
      const splits = object.id.split("/");
      if (misc.isNumber(splits[0]) && misc.isNumber(splits[1])) {
        this.id = object.id;
        if (object.text !== "") {
          this.text = cleanTextAsCorrectTable(object.text);
        }
        return;
      }
    }
    this.id = "2018/01";
  }

  year(): string {
    return this.id && this.id.split("/")[0];
  }

  textMovedTwoMonths() {
    const oldEvents = eventsToObject(this.text);
    const newEvents = oldEvents.map((each) => {
      return each.moveBy({ monate: 2 });
    });
    return eventsToText(newEvents);
  }

  asEvents(): Event[] {
    return eventsToObject(this.text);
  }

  eventsToSend(aDatumUhrzeit: DatumUhrzeit): EmailEvent[] {
    const events = this.asEvents()
      .filter((e) => !!e.email)
      .map((e) => new EmailEvent(e));
    return events.filter((e) => e.shouldSendOn(aDatumUhrzeit));
  }
}
