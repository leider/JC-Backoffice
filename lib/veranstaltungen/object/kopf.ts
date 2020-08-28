export default class Kopf {
  beschreibung = "";
  eventTyp = "";
  flaeche = "";
  kooperation = "";
  ort = "Jubez";
  titel = "";
  pressename = "";
  presseIn = "";
  genre = "";
  confirmed = false;
  rechnungAnKooperation = false;

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object);
    }
  }

  get isValid(): boolean {
    return this.titel.length > 0;
  }

  isKooperation(): boolean {
    return !!this.kooperation && this.kooperation !== "_";
  }

  rechnungAnKooperationspartner(): boolean {
    return !this.rechnungAnKooperation ? this.isKooperation() : this.rechnungAnKooperation;
  }

  pressenameEcht(): string {
    return this.pressename || this.ort;
  }

  presseInEcht(): string {
    return this.presseIn || this.pressenameEcht();
  }
}
