import misc from "../commons/misc.js";
import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import { Event } from "./Event.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import map from "lodash/map.js";
import invokeMap from "lodash/invokeMap.js";
import sortBy from "lodash/sortBy.js";

export default class Kalender {
  id: string;
  events: Event[] = [];
  migrated = false;

  constructor(object?: RecursivePartial<Kalender>) {
    if (object && object.id && object.id.split("/").length === 2) {
      const splits = object.id.split("/");
      if (misc.isNumber(splits[0]) && misc.isNumber(splits[1])) {
        this.id = object.id;
        this.events = map(object.events, (each) => new Event(each));
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
    const result: Event[] = invokeMap(this.events, "cloneAndMoveBy", { monate: differenz });
    return sortBy(result, ["start"]);
  }

  sortEvents() {
    this.events.sort((a, b) => a.start?.localeCompare(b.start));
  }
}
