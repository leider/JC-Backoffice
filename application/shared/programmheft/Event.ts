import DatumUhrzeit, { AdditionOptions } from "../commons/DatumUhrzeit.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import map from "lodash/map.js";
import capitalize from "lodash/capitalize.js";

export class Event {
  start: string;
  farbe: string;
  emailOffset?: number;
  was?: string;
  users: string[] = [];

  constructor({ start, farbe, emailOffset, was, users }: RecursivePartial<Event>) {
    this.start = DatumUhrzeit.forISOString(start!).toISOString;
    this.farbe = farbe!;
    this.emailOffset = emailOffset;
    this.was = was;
    this.users = users ?? [];
  }

  private get names() {
    return map(this.users, capitalize).join(", ");
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
