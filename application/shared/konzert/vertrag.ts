import misc from "../commons/misc.js";
import renderer from "../commons/renderer.js";

export type Sprache = "Deutsch" | "Englisch" | "Regional";
export type Vertragsart = "Jazzclub" | "Agentur/Künstler" | "JazzClassix";

export default class Vertrag {
  art: Vertragsart = "Jazzclub";
  sprache: Sprache = "Deutsch";
  datei: string[] = [];
  zusatzvereinbarungen?: string;

  static arten(): Vertragsart[] {
    return ["Jazzclub", "Agentur/Künstler", "JazzClassix"];
  }

  static sprachen(): Sprache[] {
    return ["Deutsch", "Englisch", "Regional"];
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        datei: misc.toArray(object.datei),
      });
    }
  }

  get zusatzvereinbarungenHtml(): string {
    return renderer.render(this.zusatzvereinbarungen ?? "");
  }

  updateDatei(datei: string): boolean {
    const imagePushed = misc.pushImage(this.datei, datei);
    if (imagePushed) {
      this.datei = imagePushed;
      return true;
    }
    return false;
  }

  removeDatei(datei: string): void {
    this.datei = misc.dropImage(this.datei, datei);
  }
}
