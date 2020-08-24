export interface KontaktUI {
  auswahl: string;
  name: string;
  ansprechpartner: string;
  telefon: string;
  email: string;
  adresse: string;
}

export default class Kontakt {
  adresse = "";
  ansprechpartner = "";
  email = "";
  name = "";
  telefon = "";
  auswahl = "";
  isToSave = false;

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object);
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
