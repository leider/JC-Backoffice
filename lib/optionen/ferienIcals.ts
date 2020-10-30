import Termin, { TerminType } from "../ical/termin";

export class Ical {
  name = "";
  url = "";
  typ: TerminType = "Sonstiges";

  constructor(object?: any) {
    if (object) {
      Object.assign(this, object);
    }
  }

  toJSON(): any {
    return Object.assign({}, this);
  }
}

export type CalSource = string | { color: string; url: string };

export default class FerienIcals {
  id = "ferienIcals";
  icals: Ical[] = [];

  static fromJSON(object?: any): FerienIcals {
    return new FerienIcals(object);
  }

  constructor(object?: any) {
    if (object && object.icals) {
      this.icals = (object.icals || []).map((each: any) => new Ical(each));
    }
  }

  toJSON(): any {
    const res: any = {};
    Object.assign(res, this);
    res.icals = this.icals.map((i) => i.toJSON());
    return res;
  }

  forCalendar(): CalSource[] {
    return this.icals.map((ical) => {
      return {
        color: Termin.colorForType(ical.typ),
        url: "/ical/eventsFromIcalURL/" + encodeURIComponent(ical.url),
      };
    });
  }
}
