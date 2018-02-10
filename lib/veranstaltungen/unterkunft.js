const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

function parseToDate(dateString, timeString) {
  if (dateString) {
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
    ['einzelNum', 'doppelNum', 'suiteNum', 'kommentar', 'transportText'].forEach(field => {
      this.state[field] = object[field];
    });

    ['sonstiges'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });

    this.state.anreiseDate = parseToDate(object.anreiseDate);
    this.state.abreiseDate = parseToDate(object.abreiseDate);

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

  minimalStartForHotel() {
    return this.veranstaltungstagAsMoment.clone().subtract(7, 'days').format('L');
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

  transportText() {
    return this.state.transportText;
  }

  sonstiges() {
    return this.state.sonstiges;
  }

  anzahlNaechte() {
    return moment(this.abreiseDate()).diff(this.anreiseDate(), 'days') || 0;
  }

  anzahlZimmer() {
    return this.einzelNum() + this.doppelNum() + this.suiteNum();
  }

  kostenTotalEUR() {
    const naechte = this.anzahlNaechte();
    return this.einzelNum() * this.einzelEUR() * naechte
      + this.doppelNum() * this.doppelEUR() * naechte
      + this.suiteNum() * this.suiteEUR() * naechte
      + this.transportEUR();
  }

  checkStep(stepname) {
    this.state[stepname] = true;
  }

  uncheckStep(stepname) {
    delete this.state[stepname];
  }

  isChecked(stepname) {
    return !!this.state[stepname];
  }

  workflow() {
    return ['angefragt', 'bestätigt'];
  }

}

module.exports = Unterkunft;
