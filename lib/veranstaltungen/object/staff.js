const R = require('ramda');

const beans = require('simple-configure').get('beans');
const misc = beans.get('misc');

class Staff {
  constructor(object) {
    this.state = object || {};

    ['techniker', 'technikerV', 'merchandise', 'kasse', 'kasseV', 'mod'].forEach(field => {
      this.state[field] = object[field] || [];
    });
    if (this.state.merchandiseNotNeeded === undefined) {
      this.state.merchandiseNotNeeded = true;
    }
  }

  fillFromUI(object) {
    ['techniker', 'technikerV', 'kasse', 'kasseV', 'merchandise', 'mod'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['technikerNotNeeded', 'technikerVNotNeeded', 'kasseNotNeeded', 'kasseVNotNeeded', 'modNotNeeded', 'merchandiseNotNeeded'].forEach(field => {
      this.state[field] = !object[field]; // When editing we mirror checkbox semantics
    });
    return this;
  }

  updateStaff(object) {
    ['techniker', 'technikerV', 'kasse', 'kasseV', 'merchandise', 'mod'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['technikerNotNeeded', 'technikerVNotNeeded', 'kasseNotNeeded', 'kasseVNotNeeded', 'modNotNeeded', 'merchandiseNotNeeded'].forEach(field => {
      this.state[field] = !object[field]; // When editing we mirror checkbox semantics
    });
  }

  noStaffNeeded() {
    return this.technikerNotNeeded() && this.technikerVNotNeeded() && this.kasseNotNeeded() && this.kasseVNotNeeded() && this.merchandiseNotNeeded();
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

  merchandiseNotNeeded() {
    return !!this.state.merchandiseNotNeeded;
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

  technikerText() {
    return this.technikerAlle().length > 0 ? this.technikerAlle().join(', ') : '-';
  }

  kassiererText() {
    return this.kasseAlle().length > 0 ? this.kasseAlle().join(', ') : '-';
  }

  tooltipInfos() {
    if (this.noStaffNeeded()) { return ''; }
    return ' Kasse: ' + this.kassiererText() + ' | Techniker: ' + this.technikerText();
  }

  enrichUsers(users) {
    const filledUsers = {};
    ['techniker', 'technikerV', 'kasse', 'kasseV', 'merchandise', 'mod'].forEach(field => {
      if (this.state[field]) {
        filledUsers[field] = users.filter(u => R.contains(u.id, this.state[field]));
      }
    });
    this.state.mitarbeiterTransient = filledUsers;
  }

  mitarbeiterTransient() {
    return this.state.mitarbeiterTransient;
  }

  kasseFehlt() {
    return (!this.kasseNotNeeded() && this.kasse().length === 0) || (!this.kasseVNotNeeded() && this.kasseV().length === 0);
  }
}

module.exports = Staff;
