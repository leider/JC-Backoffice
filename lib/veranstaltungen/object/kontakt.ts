export default class Kontakt {
  state: any;
  constructor(object: any) {
    this.state = object;
  }

  fillFromUI(object: any) {
    this.state.auswahl = object.auswahl;
    this.state.name = object.name;
    this.state.ansprechpartner = object.ansprechpartner;
    this.state.telefon = object.telefon;
    this.state.email = object.email;
    this.state.adresse = object.adresse;
    return this;
  }

  auswahl() {
    return this.state.auswahl;
  }

  name() {
    return this.state.name;
  }

  telefon() {
    return this.state.telefon;
  }

  email() {
    return this.state.email;
  }

  ansprechpartner() {
    return this.state.ansprechpartner;
  }

  adresse() {
    return this.state.adresse;
  }

  strasse() {
    if (this.adresse()) {
      const lines = this.adresse().split('\r\n');
      return lines[0] || '-';
    }
    return '-';
  }

  ort() {
    if (this.adresse()) {
      const lines = this.adresse().split('\r\n');
      return lines[1] || '-';
    }
    return '-';
  }

  einzeiligeAdresse() {
    if (this.adresse()) {
      return this.state.adresse.replace('\r\n', ', ');
    }
    return '-';
  }

  adresseHTML() {
    return this.state.adresse.replace('\r\n', '<br>');
  }
}
