import R from 'ramda';

import Termin, { TerminType } from '../ical/termin';

interface Ical {
  oldname?: string;
  name: string;
  url: string;
  typ: TerminType;
}

interface FerienIcalsRaw {
  id: string;
  icals: Ical[];
}

export default class FerienIcals {
  id = 'ferienIcals';
  icals: Ical[] = [];

  static fromJSON(object?: FerienIcalsRaw): FerienIcals {
    return Object.assign(new FerienIcals(), object);
  }

  toJSON(): FerienIcalsRaw {
    return Object.assign({}, this);
  }

  forName(name: string): Ical | undefined {
    return this.icals.find(ical => ical.name === name);
  }

  addIcal(object: Ical) {
    delete object.oldname;
    if (this.forName(object.name)) {
      return this.updateIcal(object.name, object);
    }
    this.icals.push(object);
  }

  deleteIcal(name: string) {
    if (name) {
      this.icals = R.reject(R.propEq('name', name))(this.icals);
    }
  }

  updateIcal(oldname: string, object: Ical) {
    const ical = this.forName(oldname);
    if (!ical) {
      return;
    }
    ical.name = object.name;
    ical.url = object.url;
    ical.typ = object.typ;
  }

  forCalendar() {
    return this.icals.map(ical => {
      return {
        color: Termin.colorForType(ical.typ),
        url: '/ical/eventsFromIcalURL/' + encodeURIComponent(ical.url)
      };
    });
  }
}
