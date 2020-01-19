import Renderer from "../../commons/renderer";

export interface KopfRaw {
  beschreibung: string;
  eventTyp: string;
  flaeche: string;
  kooperation: string;
  ort: string;
  titel: string;
  pressename: string;
  presseIn: string;
  genre: string;
  confirmed: boolean;
  rechnungAnKooperation: boolean;
}

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

export default class Kopf implements KopfRaw {
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

  toJSON(): KopfRaw {
    return this;
  }

  constructor(object?: KopfRaw) {
    if (object) {
      this.beschreibung = object.beschreibung;
      this.eventTyp = object.eventTyp;
      this.flaeche = object.flaeche;
      this.kooperation = object.kooperation;
      this.ort = object.ort;
      this.titel = object.titel;
      this.pressename = object.pressename;
      this.presseIn = object.presseIn;
      this.genre = object.genre;
      this.confirmed = object.confirmed;
      this.rechnungAnKooperation = object.rechnungAnKooperation;
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

  beschreibungHTML(): string {
    return Renderer.render(this.beschreibung);
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
