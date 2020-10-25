import DatumUhrzeit from "../commons/DatumUhrzeit";

export type TerminType = "Sonstiges" | "Feiertag" | "Ferien" | "Vermietung";

export type TerminEvent = {
  color: string;
  start: string;
  end: string;
  title: string;
  tooltip: string;
};

interface TerminUI {
  id?: string;
  beschreibung: string;
  typ: TerminType;
  startDate: string;
  endDate: string;
}

export default class Termin {
  id?: string;
  beschreibung?: string;
  typ: TerminType = "Sonstiges";
  startDate: Date = new DatumUhrzeit().toJSDate;
  endDate: Date = this.startDate;

  constructor(object?: any) {
    if (object) {
      Object.assign(this, object);
      if (!this.id) {
        this.id = DatumUhrzeit.forJSDate(this.startDate).toLocalDateTimeString;
      }
    }
  }

  toJSON(): any {
    return Object.assign({}, this);
  }

  static typen(): string[] {
    return ["Sonstiges", "Feiertag", "Ferien"];
  }

  static colorForType(typ: TerminType): string {
    return {
      Sonstiges: "#d6bdff",
      Feiertag: "#c1c3ff",
      Ferien: "#c1c3ff",
      Vermietung: "#cc6678",
    }[typ];
  }

  fillFromUI(object: TerminUI): Termin {
    this.startDate = DatumUhrzeit.forGermanStringOrNow(object.startDate).toJSDateUTC;
    this.endDate = DatumUhrzeit.forGermanStringOrNow(object.endDate, "12:00").toJSDateUTC;
    this.id = object.id || new DatumUhrzeit().toLocalDateTimeString;
    this.beschreibung = object.beschreibung;
    this.typ = object.typ || Termin.typen()[0];
    return this;
  }

  startDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.startDate);
  }

  endDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.endDate);
  }

  asEvent(): TerminEvent {
    return {
      color: Termin.colorForType(this.typ),
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      title: this.beschreibung || "",
      tooltip: this.beschreibung || "",
    };
  }
}
