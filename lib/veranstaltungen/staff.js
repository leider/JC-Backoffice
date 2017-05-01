const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

class Staff {
  constructor(object) {
    this.state = object || {};

    ['techniker', 'merchandise', 'fremdpersonal', 'kasse'].forEach(field => {
      this.state[field] = object[field] || [];
    });
  }

  fillFromUI(object) {
    ['technikerEUR', 'merchandiseEUR', 'kasseEUR', 'fremdpersonalEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['techniker', 'merchandise', 'fremdpersonal', 'kasse'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    return this;
  }

  techniker() {
    return this.state.techniker;
  }

  merchandise() {
    return this.state.merchandise;
  }

  kasse() {
    return this.state.kasse;
  }

  fremdpersonal() {
    return this.state.fremdpersonal;
  }

  technikerEUR() {
    return this.state.technikerEUR;
  }

  merchandiseEUR() {
    return this.state.merchandiseEUR;
  }

  kasseEUR() {
    return this.state.kasseEUR;
  }

  fremdpersonalEUR() {
    return this.state.fremdpersonalEUR;
  }

  staffTotalEUR() {
    return (this.techniker().length * this.technikerEUR() || 0)
      + (this.kasse().length * this.kasseEUR() || 0)
      + (this.merchandise().length * this.merchandiseEUR() || 0)
      + (this.fremdpersonal().length * this.fremdpersonalEUR() || 0);
  }

  technikerText() {
    return this.techniker().length > 0 ? this.techniker().join(', ') : '-';
  }

  kassiererText() {
    return this.kasse().length > 0 ? this.kasse().join(', ') : '-';
  }

  merchandiseText() {
    return this.merchandise().length > 0 ? this.merchandise().join(', ') : '-';
  }

  tooltipInfos() {
    return 'Techniker: ' + this.technikerText() + ' - Kasse: ' + this.kassiererText();
  }
}

module.exports = Staff;
