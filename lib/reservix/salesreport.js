const moment = require('moment-timezone');

class Salesreport {

  static forRawResult(reservixID, result) {
    if (!reservixID || !result || !result.data || !result.data[0] || !result.data[0].eventId) {
      return new Salesreport();
    }
    const object = result.data[0];
    if (reservixID.toString() !== object.eventId.toString()) {
      return new Salesreport();
    }
    object.tsServer = result.tsServer;
    object.id = (object.eventId && object.eventId.toString());
    object.datumUhrzeit = result.startDate + ' ' + result.startTime;
    return new Salesreport(object);
  }

  constructor(object = {}) {
    this.now = moment().unix(); // lebt nur kurz!
    if (object.verkaeufe) {
      this.state = object;
    } else {
      this.original = object; // for debugging
      this.state = {
        verkaeufe: (object.sales && object.sales.aggregation
          || {
            salesWithFees: 0,
            bookingFees: 0
          }),
        id: object.id,
        timestamp: moment(object.tsServer, 'YYYY-MM-DD HH:mm:ss').toDate(),
        datumUhrzeit: moment(object.datumUhrzeit, 'YYYY-MM-DD HH:mm:ss').toDate()
      };
    }
  }

  id() {
    return this.state.id;
  }

  verkaeufe() {
    return this.state.verkaeufe;
  }

  anzahlRegulaer() {
    return this.verkaeufe().orderedTickets || 0;
  }

  bruttoUmsatz() {
    return this.verkaeufe().salesWithFees || 0;
  }

  gebuehren() {
    return this.verkaeufe().bookingFees || 0;
  }

  timestamp() {
    return moment(this.state.timestamp).format();
  }

  istVeraltet() {
    const timestamp = moment(this.state.timestamp).unix(); //seconds
    return !this.istVergangen() && this.now - timestamp > 60 * 60; // 1 Stunde
  }

  istVergangen() {
    const datumUhrzeit = moment(this.state.datumUhrzeit).unix();
    return datumUhrzeit - this.now < 60 * 60 * 24; // nach 24 Stunden ist das Event vorbei
  }
}

module.exports = Salesreport;
