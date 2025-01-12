import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";

export type TerminType = "Sonstiges" | "Feiertag" | "Ferien" | "Vermietung";

export type TerminFilterOptions = {
  icals: TerminType[];
  termine: TerminType[];
};
export interface TerminEvent {
  start: string;
  end: string;
  title: string;
  tooltip: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  display?: string;
  className?: string;
  url?: string;
  linkTo?: string;
}

export default class Termin {
  id: string;
  beschreibung?: string;
  typ: TerminType = "Sonstiges";
  startDate: Date = new DatumUhrzeit().toJSDate;
  endDate: Date = this.startDate;

  constructor(object?: Partial<Termin>) {
    if (object) {
      this.beschreibung = object.beschreibung;
      this.typ = object.typ ?? "Sonstiges";
      this.startDate = Misc.stringOrDateToDate(object.startDate) || new DatumUhrzeit().toJSDate;
      this.endDate = Misc.stringOrDateToDate(object.endDate) || this.startDate;
    } else {
      this.startDate = new DatumUhrzeit().toJSDate;
      this.endDate = this.startDate;
    }
    this.id = object?.id ? object.id : encodeURIComponent(DatumUhrzeit.forJSDate(this.startDate).fuerCalendarWidget + this.beschreibung);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  static colorForType(typ: TerminType): string {
    return {
      Sonstiges: "#d6bdff",
      Feiertag: "#c1c3ff",
      Ferien: "#c1c3ff",
      Vermietung: "#cc6678",
    }[typ];
  }

  startDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.startDate);
  }

  endDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.endDate);
  }

  get asEvent(): TerminEvent {
    return {
      display: "block",
      borderColor: Termin.colorForType(this.typ),
      backgroundColor: Termin.colorForType(this.typ),
      textColor: "#fff",
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      title: this.beschreibung || "",
      tooltip: this.beschreibung || "",
    };
  }
}
