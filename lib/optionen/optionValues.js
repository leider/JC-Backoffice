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

  addOrUpdateBackline(backlineKey, backline) {
    const skey = ('backline' + backlineKey);
    if (!this.state[skey]) {
      this.state[skey] = [];
    }
    const existingBackline = this.state[skey];
    misc.toArray(backline).forEach(item => {
      if (existingBackline.indexOf(item) < 0) {
        existingBackline.push(item);
      }
    });
  }

  verantwortliche() {
    return this.state.verantwortliche || [];
  }
}

module.exports = OptionValues;
