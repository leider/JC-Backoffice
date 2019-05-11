const conf = require('simple-configure');
const beans = conf.get('beans');
const DatumUhrzeit = beans.get('DatumUhrzeit');

class Salesreport {

  constructor(object = {}) {
    this.now = new DatumUhrzeit(); // lebt nur kurz!
    this.state = object;
  }

  id() {
    return this.state.id;
  }

  anzahlRegulaer() {
    return this.state.anzahl || 0;
  }

  bruttoUmsatz() {
    return this.state.brutto || 0;
  }

  nettoUmsatz() {
    return this.state.netto || 0;
  }

  gebuehren() {
    return this.bruttoUmsatz() - this.nettoUmsatz();
  }

  updated() {
    return DatumUhrzeit.forJSDate(this.state.updated);
  }

  istVeraltet() {
    const lastUpdated = this.updated();
    return !this.istVergangen() &&
      (this.beginntInZwoelfStunden()
          ? this.now.minus({minuten: 10}).istNach(lastUpdated)
          : this.now.minus({minuten: 60}).istNach(lastUpdated)
      );
  }

  startDatumUhrzeit() {
    return DatumUhrzeit.forJSDate(this.state.datum);
  }

  istVergangen() {
    if (!this.state.datum) {
      return false;
    }
    return this.startDatumUhrzeit().plus({tage: 1}).istVor(this.now);
  }

  beginntInZwoelfStunden() {
    if (!this.state.datum) {
      return false;
    }
    return this.startDatumUhrzeit().minus({stunden: 12}).istVor(this.now);
  }
}

module.exports = Salesreport;
