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
    return this.techniker().length * this.technikerEUR()
      + this.kasse().length * this.kasseEUR()
      + this.merchandise().length * this.merchandiseEUR()
      + this.fremdpersonal().length * this.fremdpersonalEUR();
  }

}

module.exports = Staff;
