import R from 'ramda';

import Termin, { TerminType } from '../ical/termin';

interface Ical {
  name: string;
  url: string;
  typ: TerminType;
}

export default class FerienIcals {
  state: any;

  constructor(object: any) {
    this.state = object ? object : {};
    this.state.id = 'ferienIcals';
    this.state.icals = (object && object.icals) || [];
  }

  icals(): Ical[] {
    return this.state.icals;
  }

  forName(name: string): Ical | undefined {
    return this.icals().find(ical => ical.name === name);
  }

  forNameOrNew(name: string) {
    return this.forName(name) || { name: 'NEU', url: '', typ: 'Ferien' };
  }

  addIcal(object: any) {
    delete object.oldname;
    if (this.forName(object.name)) {
      return this.updateIcal(object.name, object);
    }
    this.icals().push(object);
  }

  deleteIcal(name: string) {
    if (name) {
      this.state.icals = R.reject(R.propEq('name', name))(this.icals());
    }
  }

  updateIcal(oldname:string, object: Ical) {
    const ical = this.forName(oldname);
    if (!ical) {
      return;
    }
    ical.name = object.name;
    ical.url = object.url;
    ical.typ = object.typ;
  }

  forCalendar() {
    return this.icals().map(ical => {
      return {
        color: Termin.colorForType(ical.typ),
        url: '/ical/eventsFromIcalURL/' + encodeURIComponent(ical.url)
      };
    });
  }
}
