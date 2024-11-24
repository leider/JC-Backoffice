import misc from "../commons/misc.js";
import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import { Event } from "./Event.js";

function eventsToObject(contents: string): Event[] {
  const lines = contents.split(/[\n\r]/);
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

export default class Kalender {
  id: string;
  text = "";
  events: Event[] = [];

  constructor(object?: { id: string; text: string; events?: Event[] }) {
    if (object && object.id && object.id.split("/").length === 2) {
      const splits = object.id.split("/");
      if (misc.isNumber(splits[0]) && misc.isNumber(splits[1])) {
        this.id = object.id;
        if (object.text !== "") {
          this.text = object.text;
        }
        if (!object.events) {
          this.events = eventsToObject(this.text);
        } else {
          this.events = object.events.map((each) => new Event(each));
        }
        return;
      }
    }
    this.id = "2018/01";
  }

  year(): string {
    return this.id && this.id.split("/")[0];
  }

  eventsMovedWithBase(otherKalId: string) {
    const thisDatum = DatumUhrzeit.forYYYYslashMM(this.id);
    const otherDatum = DatumUhrzeit.forYYYYslashMM(otherKalId);
    const differenz = otherDatum.differenzInMonaten(thisDatum);
    const result = this.events.map((each) => {
      return new Event(each).moveBy({ monate: differenz });
    });
    result.sort((a, b) => a.start.localeCompare(b.start));
    return result;
  }

  sortEvents() {
    this.events.sort((a, b) => a.start.localeCompare(b.start));
  }

  eventsToSend(aDatumUhrzeit: DatumUhrzeit): EmailEvent[] {
    const events = this.events.filter((e) => !!e.email).map((e) => new EmailEvent(e));
    return events.filter((e) => e.shouldSendOn(aDatumUhrzeit));
  }
}
