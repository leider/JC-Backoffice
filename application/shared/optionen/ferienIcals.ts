import Termin, { TerminType } from "./termin.js";
import Misc from "../commons/misc.js";

export class Ical {
  name = "";
  url = "";
  typ: TerminType = "Sonstiges";

  constructor(object?: Partial<Ical>) {
    if (object) {
      Object.assign(this, object);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return Object.assign({}, this);
  }

  get color(): string {
    return Termin.colorForType(this.typ);
  }
}

export class KalenderEvents {
  id = "";
  content = "";
  updatedAt?: Date = new Date();

  constructor(object?: Partial<KalenderEvents>) {
    if (object) {
      this.id = object.id ?? "";
      this.content = object.content ?? "";
      this.updatedAt = Misc.stringOrDateToDate(object.updatedAt);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return Object.assign({}, this);
  }
}

export default class FerienIcals {
  id = "ferienIcals";
  icals: Ical[] = [];

  constructor(object?: Partial<FerienIcals>) {
    if (object && object.icals) {
      this.icals = ((object.icals || []) as Ical[]).map((each) => new Ical(each));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return Object.assign({}, this, {
      icals: this.icals.map((i) => i.toJSON()),
    });
  }
}
