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
  abgesagt = false;
  fotografBestellen = false;

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

  private get isKooperation(): boolean {
    return !!this.kooperation && this.kooperation !== "_";
  }

  get rechnungAnKooperationspartner(): boolean {
    return !this.rechnungAnKooperation ? this.isKooperation : this.rechnungAnKooperation;
  }

  get presseInEcht(): string {
    return this.presseIn || this.pressename || this.ort;
  }

  get titelMitPrefix(): string {
    return `${this.abgesagt ? "Abgesagt: " : ""}${this.titel}`;
  }

  get kooperationspartnerText(): string {
    return this.isKooperation ? this.kooperation : "";
  }
}
