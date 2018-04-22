const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

class Artist {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['bandname'].forEach(field => {
      this.state[field] = object[field];
    });
    ['name'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['numMusiker', 'numCrew'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['isBawue', 'isAusland'].forEach(field => {
      this.state[field] = !!object[field];
    });
    return this;
  }

  isAusland() {
    return this.state.isAusland;
  }

  isBawue() {
    return this.state.isBawue;
  }

  bandname() {
    return this.state.bandname;
  }

  name() {
    return misc.toArray(this.state.name); // legacy, was text before
  }

  numMusiker() {
    return this.state.numMusiker || 1;
  }

  numCrew() {
    return this.state.numCrew || 0;
  }

  numForCatering() {
    return this.numMusiker() + this.numCrew();
  }
}

module.exports = Artist;
