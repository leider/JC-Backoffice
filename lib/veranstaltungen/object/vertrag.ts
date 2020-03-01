import misc from "../../commons/misc";

export type Sprache = "Deutsch" | "Englisch" | "Regional";
export type Vertragsart = "Jazzclub" | "Agentur/Künstler" | "JazzClassix";

export interface VertragUI {
  art: Vertragsart;
  sprache: Sprache;
  datei: string[];
}

export default class Vertrag {
  art: Vertragsart = "Jazzclub";
  sprache: Sprache = "Deutsch";
  datei: string[] = [];

  static arten(): Vertragsart[] {
    return ["Jazzclub", "Agentur/Künstler", "JazzClassix"];
  }

  static sprachen(): Sprache[] {
    return ["Deutsch", "Englisch", "Regional"];
  }

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        datei: misc.toArray(object.datei)
      });
    }
  }

  fillFromUI(object: VertragUI): Vertrag {
    this.art = object.art;
    this.sprache = object.sprache;
    return this;
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
