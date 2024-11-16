import misc from "../commons/misc.js";
import DatumUhrzeit from "../commons/DatumUhrzeit.js";

export type Event = {
  start: string;
  end: string;
  title: string;
  farbe: string;
  email?: string;
  emailOffset?: number;
  was?: string;
  wer?: string;
};

function eventsToObject(contents?: string, jahrMonat?: string): Event[] {
  if (!contents || !jahrMonat) {
    return [];
  }
  const jmArray = jahrMonat.split("/");

  function lineToObject(line: string): Event | undefined {
    const datum = DatumUhrzeit.forYYYYMM(jmArray[0] + jmArray[1]).minus({
      monate: 2,
    });

    function padLeftWithZero(aNumberString: string): string {
      return (aNumberString.length === 1 ? "0" : "") + aNumberString;
    }

    function toDate(dayMonthString: string, stunde = "00:00"): Date | null {
      const dayMonth = dayMonthString ? dayMonthString.split(".") : [];
      if (dayMonth.length < 2) {
        return null;
      }
      if (!misc.isNumber(dayMonth[0]) || !misc.isNumber(dayMonth[1])) {
        return null;
      }
      const day = padLeftWithZero(dayMonth[0]);
      const month = padLeftWithZero(dayMonth[1]);
      const dateString = `${day}.${month}.${datum.jahr}`;
      return DatumUhrzeit.forGermanStringOrNow(dateString, stunde).toJSDate;
    }

    function dates(element: string): string[] | null {
      if (element.trim()) {
        const fromAndUntil = misc.compact(element.split("-").map((each) => each.trim()));
        const from = toDate(fromAndUntil[0]);
        const until = toDate(fromAndUntil[1] || fromAndUntil[0], "22:00"); // 22 hours
        if (from && until) {
          return [from.toISOString(), until.toISOString()];
        }
      }
      return null;
    }

    const elements = line.replace(/^[|.]/, "").split("|");
    if (elements.length < 4) {
      return;
    }
    const was = elements[0];
    const wer = elements[1];
    const farbe = elements[2];
    const fromUntil = dates(elements[3]);
    const email = elements[4] || "";
    const emailOffset = misc.isNumber(elements[5]) ? Number.parseInt(elements[5]) : 7;
    if (was && fromUntil) {
      if (!email) {
        return {
          start: fromUntil[0],
          end: fromUntil[1],
          title: was.trim() + " (" + wer.trim() + ")",
          farbe: farbe.trim(),
        };
      }
      return {
        start: fromUntil[0],
        end: fromUntil[1],
        title: was.trim() + " (" + wer.trim() + ")",
        farbe: farbe.trim(),
        email: email.trim(),
        emailOffset: emailOffset,
        was: was.trim(),
        wer: wer.trim(),
      };
    }
  }
  const lines = contents.replaceAll("\\", "").split(/[\n\r]/);
  return misc.compact(lines.map(lineToObject)) as Event[];
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

  email(): string | undefined {
    return this.event.email;
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
  const strings = events.map((event) => {
    return `${event.was ?? ""}|${event.wer ?? ""}|${event.farbe}|${event.start}|${event.email ?? ""}|${event.emailOffset ?? 7}`;
  });
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
    const oldEvents = eventsToObject(this.text, this.id);
    const newEvents = oldEvents.map((each) => {
      return { ...each, start: DatumUhrzeit.forISOString(each.start).plus({ monate: 2 }).tagMonatJahrKompakt };
    });
    return eventsToText(newEvents);
  }

  asEvents(): Event[] {
    return eventsToObject(this.text, this.id);
  }

  eventsToSend(aDatumUhrzeit: DatumUhrzeit): EmailEvent[] {
    const events = this.asEvents()
      .filter((e) => !!e.email)
      .map((e) => new EmailEvent(e));
    return events.filter((e) => e.shouldSendOn(aDatumUhrzeit));
  }
}
