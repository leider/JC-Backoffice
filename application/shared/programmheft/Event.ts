import DatumUhrzeit, { AdditionOptions } from "../commons/DatumUhrzeit.js";
import capitalize from "lodash/capitalize.js";

export class Event {
  start: string;
  farbe: string;
  emailOffset?: number;
  was?: string;
  users: string[] = [];

  constructor({ start, farbe, emailOffset, was, users }: Partial<Event>) {
    this.start = start!;
    this.farbe = farbe!;
    this.emailOffset = emailOffset;
    this.was = was;
    this.users = users ?? [];
  }

  private get names() {
    return this.users.map((user) => capitalize(user)).join(", ");
  }

  get title(): string {
    return `${(this.was ?? "").trim()} (${this.names.trim()})`;
  }

  cloneAndMoveBy(options: AdditionOptions) {
    const result = new Event(this);
    result.start = DatumUhrzeit.forISOString(result.start).plus(options).toISOString;
    return result;
  }
}
