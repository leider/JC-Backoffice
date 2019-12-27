import DatumUhrzeit from '../commons/DatumUhrzeit';

export type TerminType = 'Sonstiges' | 'Feiertag' | 'Ferien' | 'Vermietung';

type TerminRaw = {
  id?: string;
  beschreibung?: string;
  typ: TerminType;
  startDate?: Date;
  endDate?: Date;
};

interface TerminUI {
  id: string;
  beschreibung: string;
  typ: TerminType;
  startDate: string;
  endDate: string;
}

export default class Termin {
  state: TerminRaw;
  constructor(object?: TerminRaw) {
    this.state = object ? object : { typ: 'Sonstiges' };
  }

  static typen() {
    return ['Sonstiges', 'Feiertag', 'Ferien'];
  }

  static colorForType(typ: TerminType) {
    return {
      Sonstiges: '#d6bdff',
      Feiertag: '#c1c3ff',
      Ferien: '#c1c3ff',
      Vermietung: '#cc6678'
    }[typ];
  }

  fillFromUI(object: TerminUI) {
    // @ts-ignore
    this.state.startDate = DatumUhrzeit.forGermanString(
      object.startDate
    ).toJSDate;
    // @ts-ignore
    this.state.endDate = DatumUhrzeit.forGermanString(
      object.endDate,
      '12:00'
    ).toJSDate;
    this.state.id = object.id || new DatumUhrzeit().toLocalDateTimeString;
    this.state.beschreibung = object.beschreibung;
    this.state.typ = object.typ || Termin.typen()[0];
    return this;
  }

  id() {
    return this.state.id;
  }

  beschreibung() {
    return this.state.beschreibung;
  }

  startDatumUhrzeit() {
    return DatumUhrzeit.forJSDate(this.startDate());
  }

  endDatumUhrzeit() {
    return DatumUhrzeit.forJSDate(this.endDate());
  }

  startDate() {
    return this.state.startDate || new DatumUhrzeit().toJSDate;
  }

  endDate() {
    return this.state.endDate || this.startDate();
  }

  typ() {
    return this.state.typ;
  }

  asEvent() {
    return {
      color: Termin.colorForType(this.typ()),
      start: this.startDate().toISOString(),
      end: this.endDate().toISOString(),
      title: this.beschreibung(),
      tooltip: this.beschreibung()
    };
  }
}
