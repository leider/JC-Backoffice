import R from "ramda";

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

export default class Kopf {
  state: KopfRaw;

  toJSON(): KopfRaw {
    return this.state;
  }

  constructor(object: KopfRaw) {
    this.state = R.isEmpty(object)
      ? {
          beschreibung: "",
          eventTyp: "",
          flaeche: "",
          kooperation: "_",
          ort: "Jubez",
          titel: "",
          pressename: "",
          presseIn: "",
          genre: "",
          confirmed: false,
          rechnungAnKooperation: false
        }
      : object;
  }

  fillFromUI(object: KopfUI): Kopf {
    this.state.beschreibung = object.beschreibung || this.state.beschreibung;
    this.state.eventTyp = object.eventTyp || this.state.eventTyp;
    this.state.flaeche = object.flaeche || this.state.flaeche;
    this.state.kooperation = object.kooperation || this.state.kooperation;
    this.state.ort = object.ort || this.state.ort;
    this.state.titel = object.titel || this.state.titel;
    this.state.pressename = object.pressename || this.state.pressename;
    this.state.presseIn = object.presseIn || this.state.presseIn;
    this.state.genre = object.genre || this.state.genre;
    this.state.confirmed = !!object.confirmed;
    this.state.rechnungAnKooperation = !!object.rechnungAnKooperation;
    return this;
  }

  beschreibung(): string {
    return this.state.beschreibung;
  }

  beschreibungHTML(): string {
    return Renderer.render(this.beschreibung());
  }

  confirmed(): boolean {
    return this.state.confirmed;
  }

  eventTyp(): string {
    return this.state.eventTyp;
  }

  genre(): string {
    return this.state.genre;
  }

  kooperation(): string {
    return this.state.kooperation || "_";
  }

  isKooperation(): boolean {
    return !!this.kooperation() && this.kooperation() !== "_";
  }

  rechnungAnKooperation(): boolean {
    return !this.state.rechnungAnKooperation ? this.isKooperation() : this.state.rechnungAnKooperation;
  }

  ort(): string {
    return this.state.ort;
  }

  flaeche(): string {
    return this.state.flaeche;
  }

  pressename(): string {
    return this.state.pressename || this.ort();
  }

  presseIn(): string {
    return this.state.presseIn || this.pressename();
  }

  titel(): string {
    return this.state.titel;
  }
}
