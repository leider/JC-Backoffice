const config = require('simple-configure');
const beans = config.get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Eintrittspreise {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    if (object.preisprofil) {
      this.state.preisprofil = JSON.parse(object.preisprofil);
      if (this.state.preisprofil.name !== 'Individuell (Alt)') {
        this.state.regulaer = this.preisprofil().regulaer;
        this.state.rabattErmaessigt = this.preisprofil().rabattErmaessigt;
        this.state.rabattMitglied = this.preisprofil().rabattMitglied;
      }
      if (!this.frei()) {
        ['erwarteteBesucher'].forEach(field => {
          this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
        });
      }
      ['zuschuss'].forEach(field => {
        this.state[field] = parseFloat(object[field]);
      });
      return this;
    }
  }

  standardRabattErmaessigt() {
    return 2;
  }

  standardRabattMitglied() {
    return 5;
  }

  frei() {
    return this.state.preisprofil ? this.preisprofil().regulaer === 0 : this.state.frei;
  }

  legacyPreisprofil() {
    return this.state.frei
      ? {name: 'Freier Eintritt', regulaer: 0, rabattErmaessigt: 0, rabattMitglied: 0}
      : (this.state.regulaer !== undefined // da stand ein preis drin aus der Zeit vor den Profilen
        ? {
          name: 'Individuell (Alt)',
          regulaer: this.state.regulaer,
          rabattErmaessigt: this.state.rabattErmaessigt,
          rabattMitglied: this.state.rabattMitglied
        }
        : {});
  }

  preisprofil() {
    return this.state.preisprofil || this.legacyPreisprofil();
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
