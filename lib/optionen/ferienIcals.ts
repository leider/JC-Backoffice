import reject from "lodash/reject";

import Termin, { TerminType } from "../ical/termin";

class Ical {
  oldname?: string;
  name = "";
  url = "";
  typ: TerminType = "Sonstiges";

  constructor(object?: any) {
    if (object) {
      Object.assign(this, object);
    }
  }

  update(object: any) {
    this.name = object.name;
    this.url = object.url;
    this.typ = object.typ;
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
    return Object.assign({}, this);
  }

  forName(name: string): Ical | undefined {
    return this.icals.find((ical) => ical.name === name);
  }

  addIcal(object: any): void {
    delete object.oldname;
    if (this.forName(object.name)) {
      this.updateIcal(object.name, object);
    } else {
      this.icals.push(new Ical(object));
    }
  }

  deleteIcal(name: string): void {
    if (name) {
      this.icals = reject(this.icals, { name });
    }
  }

  updateIcal(oldname: string, object: any): void {
    const ical = this.forName(oldname);
    if (!ical) {
      return;
    }
    ical.update(object);
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
