export default class Kontakt {
  adresse = "";
  ansprechpartner = "";
  email = "";
  name = "";
  telefon = "";

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      this.adresse = object.adresse;
      this.ansprechpartner = object.ansprechpartner;
      this.email = object.email;
      this.name = object.name;
      this.telefon = object.telefon;
    }
  }

  private line(number: number, alternative = "-") {
    return this.addressLines[number] || alternative;
  }
  get strasse(): string {
    return this.line(0);
  }

  get ort(): string {
    return this.line(1);
  }

  get addressLines(): string[] {
    if (this.adresse) {
      const lines = this.adresse.match(/[^\r\n]+/g);
      return lines ?? [];
    }
    return [];
  }

  get einzeiligeAdresse(): string {
    if (this.adresse) {
      const lines = this.adresse.match(/[^\r\n]+/g);
      return lines?.join(", ") || "";
    }
    return "-";
  }
}
