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

export default class Kontakt implements KontaktRaw {
  adresse = "";
  ansprechpartner = "";
  email = "";
  name = "";
  telefon = "";
  auswahl = "";

  toJSON(): KontaktRaw {
    const result = new Kontakt() ;
    Object.assign(result, this);
    delete result.auswahl;
    return result;
  }

  constructor(object?: KontaktRaw) {
    if (object) {
      this.adresse = object.adresse;
      this.ansprechpartner = object.ansprechpartner;
      this.email = object.email;
      this.name = object.name;
      this.telefon = object.telefon;
    }
  }

  fillFromUI(object: KontaktUI): Kontakt {
    this.auswahl = object.auswahl;
    this.name = object.name;
    this.ansprechpartner = object.ansprechpartner;
    this.telefon = object.telefon;
    this.email = object.email;
    this.adresse = object.adresse;
    return this;
  }

  strasse(): string {
    if (this.adresse) {
      const lines = this.adresse.split("\r\n");
      return lines[0] || "-";
    }
    return "-";
  }

  ort(): string {
    if (this.adresse) {
      const lines = this.adresse.split("\r\n");
      return lines[1] || "-";
    }
    return "-";
  }

  einzeiligeAdresse(): string {
    if (this.adresse) {
      return this.adresse.replace("\r\n", ", ");
    }
    return "-";
  }

  adresseHTML(): string {
    return this.adresse.replace("\r\n", "<br>");
  }
}
