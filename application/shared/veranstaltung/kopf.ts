import { colorDefault, TypMitMehr } from "../optionen/optionValues.js";
import { RecursivePartial } from "../commons/advancedTypes.js";

export default class Kopf {
  beschreibung = "";
  eventTyp = "";
  eventTypRich?: TypMitMehr;
  flaeche = 100;
  kooperation = "";
  ort = "Jazzclub";
  titel = "";
  pressename = "Jazzclub Karlsruhe";
  presseIn = "im Jazzclub Karlsruhe";
  genre = "";
  confirmed = false;
  rechnungAnKooperation = false;
  abgesagt = false;
  fotografBestellen = false;
  kannAufHomePage = false;
  kannInSocialMedia = false;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: RecursivePartial<Kopf>) {
    if (object && Object.keys(object).length) {
      Object.assign(this, object);
    }
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

  get color(): string {
    return this.eventTypRich?.color ?? colorDefault;
  }
}
