const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

function parseToDate(dateString, timeString) {
  if (dateString && timeString) {
    return fieldHelpers.parseToMomentUsingDefaultTimezone(dateString, timeString).toDate();
  }
  return null;
}
class Unterkunft {
  constructor(object, veranstaltungstagAsMoment) {
    this.state = object || {};
    this.veranstaltungstagAsMoment = veranstaltungstagAsMoment;
    if (!this.state.sonstiges) {
      this.state.sonstiges = [];
    }
  }

  fillFromUI(object) {
    ['einzelEUR', 'doppelEUR', 'suiteEUR', 'transportEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['einzelNum', 'doppelNum', 'suiteNum', 'kommentar', 'bahnTransferAnkunft', 'bahnTransferAbfahrt',
      'flugTransferAnkunft', 'flugTransferAbfahrt', 'bahnhof', 'flughafen'].forEach(field => {
      this.state[field] = object[field];
    });

    ['sonstiges'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });

    const dateString = object.anreiseDate;
    this.state.anreiseDate = parseToDate(dateString);
    this.state.abreiseDate = parseToDate(object.abreiseDate);

    this.state.bahnAnkunftDate = parseToDate(object.bahnAnkunftDate, object.bahnAnkunftTime);
    this.state.bahnAbfahrtDate = parseToDate(object.bahnAbfahrtDate, object.bahnAbfahrtTime);

    this.state.flugAnkunftDate = parseToDate(object.flugAnkunftDate, object.flugAnkunftTime);
    this.state.flugAbfahrtDate = parseToDate(object.flugAbfahrtDate, object.flugAbfahrtTime);
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
    return this.bahnAbfahrtDate() ? moment(this.bahnAbfahrtDate()) : this.veranstaltungstagAsMoment;
  }

  bahnAnkunftMoment() {
    return this.bahnAnkunftDate() ? moment(this.bahnAnkunftDate()) : this.veranstaltungstagAsMoment;
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
    return this.flugAbfahrtDate() ? moment(this.flugAbfahrtDate()) : this.veranstaltungstagAsMoment;
  }

  flugAnkunftMoment() {
    return this.flugAnkunftDate() ? moment(this.flugAnkunftDate()) : this.veranstaltungstagAsMoment;
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
