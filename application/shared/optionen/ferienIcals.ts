import Termin, { TerminType } from "./termin.js";

export class Ical {
  name = "";
  url = "";
  typ: TerminType = "Sonstiges";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
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

export default class FerienIcals {
  id = "ferienIcals";
  icals: Ical[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
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
