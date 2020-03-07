export interface KopfUI {
  beschreibung?: string;
  eventTyp?: string;
  flaeche?: string;
  kooperation?: string;
  ort?: string;
  titel?: string;
  pressename?: string;
  presseIn?: string;
  genre?: string;
  confirmed?: string;
  rechnungAnKooperation?: string;
}

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

  fillFromUI(object: KopfUI): Kopf {
    this.beschreibung = object.beschreibung || this.beschreibung;
    this.eventTyp = object.eventTyp || this.eventTyp;
    this.flaeche = object.flaeche || this.flaeche;
    this.kooperation = object.kooperation || this.kooperation;
    this.ort = object.ort || this.ort;
    this.titel = object.titel || this.titel;
    this.pressename = object.pressename || this.pressename;
    this.presseIn = object.presseIn || this.presseIn;
    this.genre = object.genre || this.genre;
    this.confirmed = !!object.confirmed;
    this.rechnungAnKooperation = !!object.rechnungAnKooperation;
    return this;
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
