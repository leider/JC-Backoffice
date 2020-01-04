export interface KontaktRaw {
  name: string;
  ansprechpartner: string;
  telefon: string;
  email: string;
  adresse: string;
}

export interface KontaktUI {
  auswahl: string;
  name: string;
  ansprechpartner: string;
  telefon: string;
  email: string;
  adresse: string;
}

export default class Kontakt {
  state: KontaktRaw;
  auswahl = '';

  toJSON(): KontaktRaw {
    return this.state;
  }

  constructor(object: KontaktRaw | undefined) {
    this.state = object || {
      name: '',
      ansprechpartner: '',
      telefon: '',
      email: '',
      adresse: ''
    };
  }

  fillFromUI(object: KontaktUI): Kontakt {
    this.auswahl = object.auswahl;
    this.state.name = object.name;
    this.state.ansprechpartner = object.ansprechpartner;
    this.state.telefon = object.telefon;
    this.state.email = object.email;
    this.state.adresse = object.adresse;
    return this;
  }

  name(): string {
    return this.state.name;
  }

  telefon(): string {
    return this.state.telefon;
  }

  email(): string {
    return this.state.email;
  }

  ansprechpartner(): string {
    return this.state.ansprechpartner;
  }

  adresse(): string {
    return this.state.adresse;
  }

  strasse(): string {
    if (this.adresse()) {
      const lines = this.adresse().split('\r\n');
      return lines[0] || '-';
    }
    return '-';
  }

  ort(): string {
    if (this.adresse()) {
      const lines = this.adresse().split('\r\n');
      return lines[1] || '-';
    }
    return '-';
  }

  einzeiligeAdresse(): string {
    if (this.adresse()) {
      return this.state.adresse.replace('\r\n', ', ');
    }
    return '-';
  }

  adresseHTML(): string {
    return this.state.adresse.replace('\r\n', '<br>');
  }
}
