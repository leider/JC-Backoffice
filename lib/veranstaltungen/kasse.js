const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Kasse {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['anfangsbestandEUR', 'ausgabeBankEUR', 'ausgabeCateringEUR', 'ausgabeFahrtEUR', 'ausgabeGageEUR',
      'ausgabeHelferEUR', 'ausgabeHotelEUR', 'ausgabeMaterialEUR', 'ausgabeSonstigesEUR', 'einnahmeBankEUR',
      'einnahmeBeitragEUR', 'einnahmeSonstigesEUR', 'einnahmeSpendeEUR', 'einnahmeTicketsEUR',
      'anzahlBesucherGesamt', 'anteilBesucherMaennlich'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['ausgabeBemerkung', 'ausgabeSonstigesText', 'einnahmeSonstigesText'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  anfangsbestandEUR() {
    return this.state.anfangsbestandEUR || 500;
  }

  ausgabeBankEUR() {
    return this.state.ausgabeBankEUR || 0;
  }

  ausgabeBemerkung() {
    return this.state.ausgabeBemerkung;
  }

  ausgabeCateringEUR() {
    return this.state.ausgabeCateringEUR || 0;
  }

  ausgabeFahrtEUR() {
    return this.state.ausgabeFahrtEUR || 0;
  }

  ausgabeGageEUR() {
    return this.state.ausgabeGageEUR || 0;
  }

  ausgabeHelferEUR() {
    return this.state.ausgabeHelferEUR || 0;
  }

  ausgabeHotelEUR() {
    return this.state.ausgabeHotelEUR || 0;
  }

  ausgabeMaterialEUR() {
    return this.state.ausgabeMaterialEUR || 0;
  }

  ausgabeSonstigesEUR() {
    return this.state.ausgabeSonstigesEUR || 0;
  }

  ausgabeSonstigesText() {
    return this.state.ausgabeSonstigesText;
  }

  einnahmeBankEUR() {
    return this.state.einnahmeBankEUR || 0;
  }

  einnahmeBeitragEUR() {
    return this.state.einnahmeBeitragEUR || 0;
  }

  einnahmeSonstigesEUR() {
    return this.state.einnahmeSonstigesEUR || 0;
  }

  einnahmeSonstigesText() {
    return this.state.einnahmeSonstigesText;
  }

  einnahmeSpendeEUR() {
    return this.state.einnahmeSpendeEUR || 0;
  }

  einnahmeTicketsEUR() {
    return this.state.einnahmeTicketsEUR || 0;
  }

  anzahlBesucherGesamt() {
    return this.state.anzahlBesucherGesamt || 0;
  }

  anteilBesucherMaennlich() {
    return this.state.anteilBesucherMaennlich || 0;
  }

}

module.exports = Kasse;
