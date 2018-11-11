const config = require('simple-configure');
const beans = config.get('beans');
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
    ['zuschuss'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
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

  zuschuss() {
    return this.state.zuschuss || 0;
  }
}

module.exports = Eintrittspreise;
