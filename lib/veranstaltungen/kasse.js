const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Kasse {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['anfangsbestandEUR', 'ausgabeBankEUR', 'ausgabeCateringEUR', 'ausgabeGageEUR', 'ausgabeHelferEUR',
      'ausgabeSonstiges1EUR', 'ausgabeSonstiges2EUR', 'ausgabeSonstiges3EUR', 'einnahmeBankEUR',
      'einnahmeSonstiges1EUR', 'einnahmeTicketsEUR', 'einnahmeSonstiges2EUR',
      'reservixBruttoEUR', 'reservixNettoEUR', 'anzahlBesucherReservix'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['ausgabeSonstiges1Text', 'ausgabeSonstiges2Text', 'ausgabeSonstiges3Text',
      'einnahmeSonstiges1Text', 'einnahmeSonstiges2Text', 'anzahlBesucherAK'].forEach(field => {
      this.state[field] = object[field];
    });
    this.state.kassenfreigabe = object.kassenfreigabe || this.state.kassenfreigabe; // kann nicht mehr gelöscht werden
    return this;
  }

  // Reservix
  anzahlBesucherReservix() {
    return this.state.anzahlBesucherReservix || 0;
  }

  reservixNettoEUR() {
    return this.state.reservixNettoEUR || 0;
  }

  reservixBruttoEUR() {
    return this.state.reservixBruttoEUR || 0;
  }

  // Ende Reservix

  anfangsbestandEUR() {
    return this.state.anfangsbestandEUR || 500;
  }

  anzahlBesucherAK() {
    return Number.parseInt(this.state.anzahlBesucherAK, 10) || 0;
  }

  ausgabeBankEUR() {
    return this.state.ausgabeBankEUR || 0;
  }

  ausgabeCateringEUR() {
    return this.state.ausgabeCateringEUR || 0;
  }

  ausgabeGageEUR() {
    return this.state.ausgabeGageEUR || 0;
  }

  ausgabeHelferEUR() {
    return this.state.ausgabeHelferEUR || 0;
  }

  ausgabeSonstiges1EUR() {
    return this.state.ausgabeSonstiges1EUR || 0;
  }

  ausgabeSonstiges1Text() {
    return this.state.ausgabeSonstiges1Text;
  }

  ausgabeSonstiges2EUR() {
    return this.state.ausgabeSonstiges2EUR || 0;
  }

  ausgabeSonstiges2Text() {
    return this.state.ausgabeSonstiges2Text;
  }

  ausgabeSonstiges3EUR() {
    return this.state.ausgabeSonstiges3EUR || 0;
  }

  ausgabeSonstiges3Text() {
    return this.state.ausgabeSonstiges3Text;
  }

  ausgabenTotalEUR() {
    return this.ausgabeBankEUR() + this.ausgabeCateringEUR() + this.ausgabeGageEUR() + this.ausgabeHelferEUR() + this.ausgabeSonstiges1EUR() + this.ausgabeSonstiges2EUR() + this.ausgabeSonstiges3EUR();
  }

  einnahmeBankEUR() {
    return this.state.einnahmeBankEUR || 0;
  }

  einnahmeSonstiges1EUR() {
    return this.state.einnahmeSonstiges1EUR || 0;
  }

  einnahmeSonstiges1Text() {
    return this.state.einnahmeSonstiges1Text;
  }

  einnahmeSonstiges2EUR() {
    return this.state.einnahmeSonstiges2EUR || 0;
  }

  einnahmeSonstiges2Text() {
    return this.state.einnahmeSonstiges2Text;
  }

  einnahmeTicketsEUR() {
    return this.state.einnahmeTicketsEUR || 0;
  }

  einnahmeTotalEUR() {
    return this.einnahmeBankEUR() + this.einnahmeSonstiges1EUR() + this.einnahmeSonstiges2EUR() + this.einnahmeTicketsEUR();
  }

  endbestandEUR() {
    return this.anfangsbestandEUR() + this.einnahmeTotalEUR() - this.ausgabenTotalEUR();
  }

  kassenDifferenzEUR() {
    return this.anfangsbestandEUR() - this.endbestandEUR();
  }

  einnahmenNettoEUR() { // gage ist Bestandteil der globalen Ausgaben
    return this.ausgabeBankEUR() + this.ausgabeGageEUR() - this.kassenDifferenzEUR() || 0;
  }

  // FREIGABE

  istFreigegeben() {
    return !!this.state.kassenfreigabe;
  }

  freigabeErfolgtDurch(name) {
    this.state.kassenfreigabe = name;
  }

}

module.exports = Kasse;
