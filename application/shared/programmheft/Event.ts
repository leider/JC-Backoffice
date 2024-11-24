import DatumUhrzeit, { AdditionOptions } from "../commons/DatumUhrzeit.js";
import misc from "../commons/misc.js";
import User from "../user/user.js";
import capitalize from "lodash/capitalize.js";

export class Event {
  start: string;
  farbe: string;
  email?: string;
  emailOffset?: number;
  was?: string;
  wer?: string;
  users: string[] = [];

  constructor({
    start,
    farbe,
    email,
    emailOffset,
    was,
    wer,
    users,
  }: {
    start: string;
    farbe: string;
    email?: string;
    emailOffset?: number;
    was?: string;
    wer?: string;
    users?: string[];
  }) {
    this.start = start;
    this.farbe = farbe;
    this.email = email;
    this.emailOffset = emailOffset;
    this.was = was;
    this.wer = wer;
    this.users = users ?? [];
  }

  private get names() {
    return (this.users.length ? this.users.map((user) => capitalize(user)).join(", ") : this.wer) ?? "";
  }

  get title(): string {
    return `${(this.was ?? "").trim()} (${this.names.trim()})`;
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
      const email = elements[4] || "";
      return new Event({
        start,
        farbe: farbe.trim(),
        email: email.trim(),
        emailOffset: misc.isNumber(elements[5]) ? Number.parseInt(elements[5]) : 7,
        was: was.trim(),
        wer: wer.trim(),
      });
    }
  }

  moveBy(options: AdditionOptions) {
    this.start = DatumUhrzeit.forISOString(this.start).plus(options).toISOString;
    return this;
  }

  enhance(allUsers: User[]) {
    if (this.users.length) {
      return;
    }
    if (!this.email) {
      return;
    }
    const emails = (this.email ?? "").split(/[, ]+/).map((each) => each.trim().toLowerCase());
    const users = (this.wer ?? "").split(/[, ]+/).map((each) => each.trim().toLowerCase());
    const filtered = allUsers.filter((user) => {
      return emails.includes(user.email.toLowerCase()) || users.includes(user.id.toLowerCase());
    });
    this.users = filtered.map((user) => user.id);
  }
}
