const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Artist {
  constructor(object) {
    this.state = object || {};
    if (object.artistName) { // legacy - can be removed
      this.state.name = this.object.artistName;
    }
  }

  fillFromUI(object) {
    ['name'].forEach(field => {
      this.state[field] = object[field];
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

  name() {
    return this.state.name;
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
