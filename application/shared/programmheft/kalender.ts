import misc from "../commons/misc.js";
import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import { Event } from "./Event.js";

export default class Kalender {
  id: string;
  events: Event[] = [];
  migrated = false;

  constructor(object?: { id: string; events?: Omit<Event, "cloneAndMoveBy" | "title">[]; migrated?: boolean }) {
    if (object && object.id && object.id.split("/").length === 2) {
      const splits = object.id.split("/");
      if (misc.isNumber(splits[0]) && misc.isNumber(splits[1])) {
        this.id = object.id;
        this.events = (object.events ?? []).map((each) => new Event(each));
        this.migrated = object.migrated === true;
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
    const result = this.events.map((each) => each.cloneAndMoveBy({ monate: differenz }));
    result.sort((a, b) => a.start.localeCompare(b.start));
    return result;
  }

  sortEvents() {
    this.events.sort((a, b) => a.start.localeCompare(b.start));
  }
}
