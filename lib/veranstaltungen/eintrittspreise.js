const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Eintrittspreise {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    this.state.frei = !!object.frei;
    if (!this.frei()) {
      this.state.regulaer = fieldHelpers.parseNumberWithCurrentLocale(object.regulaer);
      this.state.rabattErmaessigt = fieldHelpers.parseNumberWithCurrentLocale(object.rabattErmaessigt);
      this.state.rabattMitglied = fieldHelpers.parseNumberWithCurrentLocale(object.rabattMitglied);
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

  mitglied() {
    return this.regulaer() - Math.abs(this.rabattMitglied());
  }

}

module.exports = Eintrittspreise;
