const beans = require('simple-configure').get('beans');
const misc = beans.get('misc');

class OptionValues {
  constructor(object) {
    this.state = object ? object : {};
    this.state.id = 'instance';
    this.state.agenturen = this.state.agenturen || [];
  }

  fillFromUI(object) {
    this.state.typen = object.typen;
    this.state.orte = object.orte;
    this.state.kooperationen = object.kooperationen;
    this.state.verantwortliche = object.verantwortliche;
    this.state.technikerEUR = object.technikerEUR;
    this.state.merchandiseEUR = object.merchandiseEUR;
    this.state.kasseEUR = object.kasseEUR;

    return this;
  }

  typen() {
    return this.state.typen || [];
  }

  orte() {
    return this.state.orte || [];
  }

  kooperationen() {
    return this.state.kooperationen || [];
  }

  kontakte(kontaktKey) {
    return [{name: '[temporär]'}, {name: '[neu]'}].concat(this.state[kontaktKey]);
  }

  agenturen() {
    return this.kontakte('agenturen');
  }

  backlineJazzclub() {
    return this.state.backlineJazzclub || [];
  }

  backlineRockshop() {
    return this.state.backlineRockshop || [];
  }

  addOrUpdateKontakt(kontaktKey, kontakt) {
    if (kontakt.auswahl.match(/\[temporär\]/)) {
      delete kontakt.auswahl;
      return;
    }
    if (kontakt.auswahl.match(/\[neu\]/)) {
      delete kontakt.auswahl;
      return this.state[kontaktKey].push(kontakt);
    }
    delete kontakt.auswahl;
    const existingKontakt = this.state[kontaktKey].find(k => k.name === kontakt.name);
    existingKontakt.ansprechpartner = kontakt.ansprechpartner;
    existingKontakt.telefon = kontakt.telefon;
    existingKontakt.email = kontakt.email;
    existingKontakt.adresse = kontakt.adresse;
  }

  updateBackline(backlineKey, backline) {
    this.updateCollection(('backline' + backlineKey), backline);
  }

  updateCollection(key, updatedCollection) {
    if (!this.state[key]) {
      this.state[key] = [];
    }
    const existingEntry = this.state[key];
    misc.toArray(updatedCollection).forEach(item => {
      if (existingEntry.indexOf(item) < 0) {
        existingEntry.push(item);
      }
    });
  }

  techniker() {
    return this.state.techniker || [];
  }

  merchandise() {
    return this.state.merchandise || [];
  }

  kasse() {
    return this.state.kasse || [];
  }

  fremdpersonal() {
    return this.state.fremdpersonal || [];
  }

  technikerEUR() {
    return this.state.technikerEUR || 100;
  }

  merchandiseEUR() {
    return this.state.merchandiseEUR || 20;
  }

  kasseEUR() {
    return this.state.kasseEUR || 20;
  }

  fremdpersonalEUR() {
    return 100;
  }

  verantwortliche() {
    return this.state.verantwortliche || [];
  }
}

module.exports = OptionValues;
