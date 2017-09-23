const R = require('ramda');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

class Staff {
  constructor(object) {
    this.state = object || {};

    ['techniker', 'technikerV', 'merchandise', 'fremdpersonal', 'kasse', 'kasseV'].forEach(field => {
      this.state[field] = object[field] || [];
    });
  }

  fillFromUI(object) {
    ['technikerEUR', 'merchandiseEUR', 'kasseEUR', 'fremdpersonalEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['techniker', 'technikerV', 'kasse', 'kasseV', 'merchandise', 'fremdpersonal'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['technikerNotNeeded', 'technikerVNotNeeded', 'kasseNotNeeded', 'kasseVNotNeeded'].forEach(field => {
      this.state[field] = !object[field]; // When editing we mirror checkbox semantics
    });
    return this;
  }

  updateStaff(object) {
    ['techniker', 'technikerV', 'kasse', 'kasseV'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['technikerNotNeeded', 'technikerVNotNeeded', 'kasseNotNeeded', 'kasseVNotNeeded'].forEach(field => {
      this.state[field] = !object[field]; // When editing we mirror checkbox semantics
    });
  }

  techniker() {
    return this.state.techniker;
  }

  technikerV() {
    return this.state.technikerV;
  }

  technikerNotNeeded() {
    return !!this.state.technikerNotNeeded;
  }

  technikerVNotNeeded() {
    return !!this.state.technikerVNotNeeded;
  }

  technikerAlle() {
    return R.union(this.technikerV(), this.techniker());
  }

  kasse() {
    return this.state.kasse;
  }

  kasseV() {
    return this.state.kasseV;
  }

  kasseNotNeeded() {
    return !!this.state.kasseNotNeeded;
  }

  kasseVNotNeeded() {
    return !!this.state.kasseVNotNeeded;
  }

  kasseAlle() {
    return R.union(this.kasseV(), this.kasse());
  }

  merchandise() {
    return this.state.merchandise;
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
    return this.technikerEUR() + this.kasseEUR() + this.merchandiseEUR() + this.fremdpersonalEUR();
  }

  technikerText() {
    return this.technikerAlle().length > 0 ? this.technikerAlle().join(', ') : '-';
  }

  kassiererText() {
    return this.kasseAlle().length > 0 ? this.kasseAlle().join(', ') : '-';
  }

  merchandiseText() {
    return this.merchandise().length > 0 ? this.merchandise().join(', ') : '-';
  }

  tooltipInfos() {
    return 'Techniker: ' + this.technikerText() + ' - Kasse: ' + this.kassiererText();
  }
}

module.exports = Staff;
