const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Staff {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    ['technikerEUR', 'merchandiseEUR', 'kasseEUR', 'fremdpersonalEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['techniker', 'merchandise', 'kasse', 'fremdpersonal'].forEach(field => {
      this.state[field] = object[field];
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

}

module.exports = Staff;