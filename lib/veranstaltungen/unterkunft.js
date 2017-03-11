const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Unterkunft {
  constructor(object) {
    this.state = object;
    if (!this.state.sonstiges) {
      this.state.sonstiges = [];
    }
  }

  fillFromUI(object) {
    ['einzelEUR', 'doppelEUR', 'suiteEUR', 'transportEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['einzelNum', 'doppelNum', 'suiteNum', 'kommentar', 'bahnTransferAnkunft', 'bahnTransferAbfahrt',
      'flugTransferAnkunft', 'flugTransferAbfahrt', 'bahnhof', 'flughafen', 'sonstiges'].forEach(field => {
      this.state[field] = object[field];
    });

    this.state.anreiseDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.anreiseDate).toDate();
    this.state.abreiseDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.abreiseDate).toDate();

    this.state.bahnAnkunftDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.bahnAnkunftDate, object.bahnAnkunftTime).toDate();
    this.state.bahnAbfahrtDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.bahnAbfahrtDate, object.bahnAbfahrtTime).toDate();

    this.state.flugAnkunftDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.flugAnkunftDate, object.flugAnkunftTime).toDate();
    this.state.flugAbfahrtDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.flugAbfahrtDate, object.flugAbfahrtTime).toDate();
    return this;
  }

  anreiseDate() {
    return this.state.anreiseDate;
  }

  abreiseDate() {
    return this.state.abreiseDate;
  }

  anreiseDisplayDate() {
    return this.anreiseDate() ? moment(this.anreiseDate()).format('L') : '';
  }

  abreiseDisplayDate() {
    return this.abreiseDate() ? moment(this.abreiseDate()).format('L') : '';
  }

  kommentar() {
    return this.state.kommentar;
  }

  einzelNum() {
    return this.state.einzelNum || 0;
  }

  doppelNum() {
    return this.state.doppelNum || 0;
  }

  suiteNum() {
    return this.state.suiteNum || 0;
  }

  einzelEUR() {
    return this.state.einzelEUR || 0;
  }

  doppelEUR() {
    return this.state.doppelEUR || 0;
  }

  suiteEUR() {
    return this.state.suiteEUR || 0;
  }

  transportEUR() {
    return this.state.transportEUR || 0;
  }

  sonstiges() {
    return this.state.sonstiges;
  }
  // bahn

  bahnhof() {
    return this.state.bahnhof;
  }

  bahnAnkunftDate() {
    return this.state.bahnAnkunftDate;
  }

  bahnAbfahrtDate() {
    return this.state.bahnAbfahrtDate;
  }

  bahnAbfahrtMoment() {
    return moment(this.bahnAbfahrtDate());
  }

  bahnAnkunftMoment() {
    return moment(this.bahnAnkunftDate());
  }

  bahnTransferAnkunft() {
    return this.state.bahnTransferAnkunft;
  }

  bahnTransferAbfahrt() {
    return this.state.bahnTransferAbfahrt;
  }

  // end bahn

  // flug

  flughafen() {
    return this.state.flughafen;
  }

  flugAnkunftDate() {
    return this.state.flugAnkunftDate;
  }

  flugAbfahrtDate() {
    return this.state.flugAbfahrtDate;
  }

  flugAbfahrtMoment() {
    return moment(this.flugAbfahrtDate());
  }

  flugAnkunftMoment() {
    return moment(this.flugAnkunftDate());
  }

  flugTransferAnkunft() {
    return this.state.flugTransferAnkunft;
  }

  flugTransferAbfahrt() {
    return this.state.flugTransferAbfahrt;
  }

  // end flug
}

module.exports = Unterkunft;
