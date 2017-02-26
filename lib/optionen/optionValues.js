class OptionValues {
  constructor(object) {
    this.state = object ? object : {};
    this.state.id = 'instance';
    this.state.kontakte = this.state.kontakte || [];
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

  kontakte() {
    return [{name: '[temporär]'}, {name: '[neu]'}].concat(this.state.kontakte);
  }

  addOrUpdateKontakt(kontakt) {
    if (kontakt.auswahl.match(/\[temporär\]/)) {
      delete kontakt.auswahl;
      return;
    }
    if (kontakt.auswahl.match(/\[neu\]/)) {
      delete kontakt.auswahl;
      return this.state.kontakte.push(kontakt);
    }
    delete kontakt.auswahl;
    const existingKontakt = this.state.kontakte.find(k => k.name === kontakt.name);
    existingKontakt.ansprechpartner = kontakt.ansprechpartner;
    existingKontakt.telefon = kontakt.telefon;
    existingKontakt.email = kontakt.email;
    existingKontakt.adresse = kontakt.adresse;
  }

  verantwortliche() {
    return this.state.verantwortliche || [];
  }
}

module.exports = OptionValues;
