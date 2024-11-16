import DatumUhrzeit, { AdditionOptions } from "../commons/DatumUhrzeit.js";
import misc from "../commons/misc.js";

type MinFields = { start: string; title: string; farbe: string };
type AdditionalFields = { email?: string; emailOffset?: number; was?: string; wer?: string };

export class Event {
  start: string;
  title: string;
  farbe: string;
  email?: string;
  emailOffset?: number;
  was?: string;
  wer?: string;

  constructor({ start, title, farbe }: MinFields) {
    this.start = start;
    this.title = title;
    this.farbe = farbe;
  }

  static minimal(event: MinFields): Event {
    return new Event(event);
  }

  static fromLine(line: string): Event | undefined {
    function toDate(dayMonthString: string, stunde = "00:00"): Date | null {
      const dayMonth = dayMonthString ? dayMonthString.split(".") : [];
      if (misc.compact(dayMonth).length < 3) {
        return null;
      }
      return DatumUhrzeit.forGermanStringOrNow(dayMonthString, stunde).toJSDate;
    }

    function dates(element: string): string | null {
      if (element.trim()) {
        const from = toDate(element);
        if (from) {
          return from.toISOString();
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
    const start = dates(elements[3]);
    if (was && start) {
      const event = Event.minimal({
        start,
        title: `${was.trim()} (${wer.trim()})`,
        farbe: farbe.trim(),
      });
      const email = elements[4] || "";
      if (email) {
        const emailOffset = misc.isNumber(elements[5]) ? Number.parseInt(elements[5]) : 7;
        event.addMore({ email: email.trim(), emailOffset: emailOffset, was: was.trim(), wer: wer.trim() });
      }
      return event;
    }
  }

  addMore({ email, emailOffset, was, wer }: AdditionalFields) {
    this.email = email;
    this.emailOffset = emailOffset;
    this.was = was;
    this.wer = wer;
  }

  get asTextLine(): string {
    return `${this.was ?? ""}|${this.wer ?? ""}|${this.farbe}|${this.start}|${this.email ?? ""}|${this.emailOffset ?? 7}`;
  }

  moveBy(options: AdditionOptions) {
    this.start = DatumUhrzeit.forISOString(this.start).plus(options).tagMonatJahrKompakt;
    return this;
  }
}
