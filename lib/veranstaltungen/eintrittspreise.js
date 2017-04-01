const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Eintrittspreise {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    this.state.frei = !!object.frei;
    if (!this.frei()) {
      ['regulaer', 'rabattErmaessigt', 'rabattMitglied', 'erwarteteBesucher'].forEach(field => {
        this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
      });
    }
    return this;
  }

  standardRabattErmaessigt() {
    return 2;
  }

  standardRabattMitglied() {
    return 5;
  }

  frei() {
    return !!this.state.frei;
  }

  regulaer() {
    return this.state.regulaer || 0;
  }

  rabattErmaessigt() {
    return this.state.rabattErmaessigt || this.standardRabattErmaessigt();
  }

  rabattMitglied() {
    return this.state.rabattMitglied || this.standardRabattMitglied();
  }

  ermaessigt() {
    return this.regulaer() - Math.abs(this.rabattErmaessigt());
  }

  erwarteteBesucher() {
    return this.state.erwarteteBesucher || 0;
  }

  mitglied() {
    return this.regulaer() - Math.abs(this.rabattMitglied());
  }

  reservix(type) {
    return this.state['reservix' + type];
  }

  reservixChanged(typeAndValue) {
    const type = typeAndValue.type;
    const value = typeAndValue.value;
    this.state['reservix' + type] = value;
  }
}

module.exports = Eintrittspreise;
