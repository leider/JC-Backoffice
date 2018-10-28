const moment = require('moment-timezone');

class Salesreport {

  constructor(object = {}) {
    this.now = moment().unix(); // lebt nur kurz!
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

  timestamp() {
    return moment(this.state.updated).format();
  }

  istVeraltet() {
    const timestamp = moment(this.state.updated).unix(); //seconds
    return !this.istVergangen() && this.now - timestamp > 60 * 60; // 1 Stunde
  }

  istVergangen() {
    const datumUhrzeit = moment(this.state.datum).unix();
    return datumUhrzeit - this.now < 60 * 60 * 24; // nach 24 Stunden ist das Event vorbei
  }
}

module.exports = Salesreport;
