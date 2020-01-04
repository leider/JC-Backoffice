import DatumUhrzeit from '../commons/DatumUhrzeit';

export interface ReservixState {
  id: string;
  anzahl?: number;
  brutto?: number;
  netto?: number;
  updated?: Date;
  datum?: Date;
}

export default class Salesreport {
  private now = new DatumUhrzeit(); // lebt nur kurz!
  state: ReservixState;
  constructor(object: ReservixState) {
    this.state = object;
  }

  id(): string {
    return this.state.id;
  }

  anzahlRegulaer(): number {
    return this.state.anzahl || 0;
  }

  bruttoUmsatz(): number {
    return this.state.brutto || 0;
  }

  nettoUmsatz(): number {
    return this.state.netto || 0;
  }

  gebuehren(): number {
    return this.bruttoUmsatz() - this.nettoUmsatz();
  }

  updated(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.state.updated || new Date());
  }

  istVeraltet(): boolean {
    const lastUpdated = this.updated();
    return (
      !this.istVergangen() &&
      (this.beginntInZwoelfStunden()
        ? this.now.minus({ minuten: 10 }).istNach(lastUpdated)
        : this.now.minus({ minuten: 60 }).istNach(lastUpdated))
    );
  }

  startDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.state.datum || new Date());
  }

  istVergangen(): boolean {
    if (!this.state.datum || this.state.datum.getTime() === 0) {
      return false;
    }
    return this.startDatumUhrzeit()
      .plus({ tage: 1 })
      .istVor(this.now);
  }

  beginntInZwoelfStunden(): boolean {
    if (!this.state.datum) {
      return false;
    }
    return this.startDatumUhrzeit()
      .minus({ stunden: 12 })
      .istVor(this.now);
  }
}
