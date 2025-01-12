import keys from "lodash/keys.js";
import { RecursivePartial } from "../commons/advancedTypes.js";

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

  constructor(object?: RecursivePartial<Kontakt>) {
    if (object && keys(object).length) {
      Object.assign(this, object);
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
