class Salesreport {

  static forRawResult(reservixID, result) {
    if (!result || !result.data || !result.data[0] || !result.data[0].eventId) {
      return null;
    }
    const object = result.data[0];
    if (reservixID.toString() !== object.eventId.toString()) {
      return null;
    }
    return new Salesreport(object);
  }

  constructor(object) {
    this.state = object || {};
  }

  verkaeufe() {
    return this.state.sales && this.state.sales.aggregation
      || {
        salesWithFees: 0,
        bookingFees: 0
      };
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
}

module.exports = Salesreport;
