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
    ['einzelNum', 'doppelNum', 'suiteNum', 'kommentar', 'transportText'].forEach(field => {
      this.state[field] = object[field];
    });

    ['sonstiges'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });

    const dateString = object.anreiseDate;
    this.state.anreiseDate = parseToDate(dateString);
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
  
}

module.exports = Unterkunft;
