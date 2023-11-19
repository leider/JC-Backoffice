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
      Object.assign(this, object);
    }
  }

  get strasse(): string {
    if (this.adresse) {
      const lines = this.adresse.match(/[^\r\n]+/g);
      return lines?.[0] || "-";
    }
    return "-";
  }

  get ort(): string {
    if (this.adresse) {
      const lines = this.adresse.match(/[^\r\n]+/g);
      return lines?.[1] || "-";
    }
    return "-";
  }

  get einzeiligeAdresse(): string {
    if (this.adresse) {
      const lines = this.adresse.match(/[^\r\n]+/g);
      return lines?.join(", ") || "";
    }
    return "-";
  }
}
