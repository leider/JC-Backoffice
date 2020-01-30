import DatumUhrzeit from "../commons/DatumUhrzeit";

export interface ReservixState {
  id: string;
  anzahl?: number;
  brutto?: number;
  netto?: number;
  updated?: Date;
  datum?: Date;
}

export default class Salesreport implements ReservixState {
  private now = new DatumUhrzeit(); // lebt nur kurz!

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
      this.updated = object.updated;
      this.datum = object.datum;
    }
  }
  toJSON(): ReservixState {
    delete this.now;
    return this;
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
    return this.startDatumUhrzeit()
      .plus({ tage: 1 })
      .istVor(this.now);
  }

  beginntInZwoelfStunden(): boolean {
    if (!this.datum) {
      return false;
    }
    return this.startDatumUhrzeit()
      .minus({ stunden: 12 })
      .istVor(this.now);
  }
}
