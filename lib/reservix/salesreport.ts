import DatumUhrzeit from "../commons/DatumUhrzeit";
import Misc from "../commons/misc";

export interface ReservixState {
  id: string;
  anzahl?: number;
  brutto?: number;
  netto?: number;
  updated?: Date | string;
  datum?: Date | string;
}

export default class Salesreport implements ReservixState {
  private _now? = new DatumUhrzeit(); // lebt nur kurz!

  id = "";
  anzahl = 0;
  brutto = 0;
  netto = 0;
  updated?: Date;
  datum?: Date;

  constructor(object?: ReservixState) {
    if (object) {
      this.id = object.id;
      this.anzahl = object.anzahl || 0;
      this.brutto = object.brutto || 0;
      this.netto = object.netto || 0;
      this.updated = Misc.stringOrDateToDate(object.updated);
      this.datum = Misc.stringOrDateToDate(object.datum);
    }
  }
  toJSON(): ReservixState {
    delete this._now;
    return this;
  }

  get now(): DatumUhrzeit {
    if (!this._now) {
      this._now = new DatumUhrzeit();
    }
    return this._now;
  }

  gebuehren(): number {
    return this.brutto - this.netto;
  }

  zuletztAktualisiert(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.updated || new Date());
  }

  istVeraltet(): boolean {
    const lastUpdated = this.zuletztAktualisiert();
    return (
      !this.istVergangen() &&
      (this.beginntInZwoelfStunden()
        ? this.now.minus({ minuten: 10 }).istNach(lastUpdated)
        : this.now.minus({ minuten: 60 }).istNach(lastUpdated))
    );
  }

  startDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.datum || new Date());
  }

  istVergangen(): boolean {
    if (!this.datum || this.datum.getTime() === 0) {
      return false;
    }
    return this.startDatumUhrzeit().plus({ tage: 1 }).istVor(this.now);
  }

  beginntInZwoelfStunden(): boolean {
    if (!this.datum) {
      return false;
    }
    return this.startDatumUhrzeit().minus({ stunden: 12 }).istVor(this.now);
  }
}
