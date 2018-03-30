const R = require('ramda');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

class Staff {
  constructor(object) {
    this.state = object || {};

    ['techniker', 'technikerV', 'merchandise', 'fremdpersonal', 'kasse', 'kasseV', 'mod'].forEach(field => {
      this.state[field] = object[field] || [];
    });
  }

  fillFromUI(object) {
    ['technikerEUR', 'merchandiseEUR', 'kasseEUR', 'fremdpersonalEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['techniker', 'technikerV', 'kasse', 'kasseV', 'merchandise', 'fremdpersonal', 'mod'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['technikerNotNeeded', 'technikerVNotNeeded', 'kasseNotNeeded', 'kasseVNotNeeded', 'modNotNeeded'].forEach(field => {
      this.state[field] = !object[field]; // When editing we mirror checkbox semantics
    });
    return this;
  }

  updateStaff(object) {
    ['techniker', 'technikerV', 'kasse', 'kasseV', 'mod'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['technikerNotNeeded', 'technikerVNotNeeded', 'kasseNotNeeded', 'kasseVNotNeeded', 'modNotNeeded'].forEach(field => {
      this.state[field] = !object[field]; // When editing we mirror checkbox semantics
    });
  }

  noStaffNeeded() {
    return this.technikerNotNeeded() && this.technikerVNotNeeded() && this.kasseNotNeeded() && this.kasseVNotNeeded();
  }

  mod() {
    return this.state.mod || '';
  }

  modNotNeeded() {
    return !!this.state.modNotNeeded;
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
    return this.state.technikerEUR || 0;
  }

  merchandiseEUR() {
    return this.state.merchandiseEUR || 0;
  }

  kasseEUR() {
    return this.state.kasseEUR || 0;
  }

  fremdpersonalEUR() {
    return this.state.fremdpersonalEUR || 0;
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
    if (this.noStaffNeeded()) { return ''; }
    return ' Kasse: ' + this.kassiererText() + ' | Techniker: ' + this.technikerText();
  }

  enrichUsers(users) {
    const filledUsers = {};
    ['techniker', 'technikerV', 'kasse', 'kasseV', 'merchandise', 'fremdpersonal'].forEach(field => {
      if (this.state[field]) {
        filledUsers[field] = users.filter(u => R.contains(u.id, this.state[field]));
      }
    });
    this.state.mitarbeiterTransient = filledUsers;
  }

  kasseFehlt() {
    return (!this.kasseNotNeeded() && this.kasse().length === 0) || (!this.kasseVNotNeeded() && this.kasseV().length === 0);
  }
}

module.exports = Staff;
