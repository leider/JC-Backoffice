import misc from "../../commons/misc";

export interface TechnikRaw {
  dateirider: string[];
  technikAngebot1?: string;
  backlineJazzclub: string[];
  backlineRockshop: string[];
  checked: boolean;
  fluegel: boolean;
}

export interface TechnikUI {
  dateirider?: string[];
  technikAngebot1?: string;
  backlineJazzclub: string | string[];
  backlineRockshop: string | string[];
  checked?: string;
  fluegel?: string;
}

export default class Technik implements TechnikRaw {
  dateirider: string[];
  technikAngebot1?: string;
  backlineJazzclub: string[];
  backlineRockshop: string[];
  checked: boolean;
  fluegel: boolean;

  toJSON(): TechnikRaw {
    return this;
  }

  constructor(object?: TechnikRaw) {
    if (object) {
      this.dateirider = object.dateirider || [];
      this.backlineJazzclub = object.backlineJazzclub;
      this.backlineRockshop = object.backlineRockshop;
      this.checked = object.checked;
      this.fluegel = object.fluegel;
    } else {
      this.dateirider = [];
      this.backlineJazzclub = [];
      this.backlineRockshop = [];
      this.checked = false;
      this.fluegel = false;
    }
  }

  fillFromUI(object: TechnikUI): Technik {
    this.dateirider = object.dateirider || this.dateirider;
    this.technikAngebot1 = object.technikAngebot1 || this.technikAngebot1;
    this.backlineJazzclub = misc.toArray(object.backlineJazzclub);
    this.backlineRockshop = misc.toArray(object.backlineRockshop);
    this.checked = !!object.checked;
    this.fluegel = !!object.fluegel;
    return this;
  }

  updateDateirider(datei: string): boolean {
    const imagePushed = misc.pushImage(this.dateirider, datei);
    if (imagePushed) {
      this.dateirider = imagePushed;
      return true;
    }
    return false;
  }

  removeDateirider(datei: string): void {
    this.dateirider = misc.dropImage(this.dateirider, datei);
  }
}
