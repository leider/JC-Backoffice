export default class Kontakt {
  adresse = "";
  ansprechpartner = "";
  email = "";
  name = "";
  telefon = "";
  auswahl?: string;
  isToSave = false;

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object);
    }
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
