import misc from '../../commons/misc';

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

export default class Technik {
  state: TechnikRaw;

  toJSON(): TechnikRaw {
    return this.state;
  }

  constructor(object: TechnikRaw | undefined) {
    this.state = object || {
      dateirider: [],
      backlineJazzclub: [],
      backlineRockshop: [],
      checked: false,
      fluegel: false
    };
    if (!this.state.dateirider) {
      this.state.dateirider = [];
    }
  }

  fillFromUI(object: TechnikUI): Technik {
    this.state.dateirider = object.dateirider || this.state.dateirider;
    this.state.technikAngebot1 =
      object.technikAngebot1 || this.state.technikAngebot1;
    this.state.backlineJazzclub = misc.toArray(object.backlineJazzclub);
    this.state.backlineRockshop = misc.toArray(object.backlineRockshop);
    this.state.checked = !!object.checked;
    this.state.fluegel = !!object.fluegel;
    return this;
  }

  updateDateirider(datei: string): boolean {
    const imagePushed = misc.pushImage(this.state.dateirider, datei);
    if (imagePushed) {
      this.state.dateirider = imagePushed;
      return true;
    }
    return false;
  }

  removeDateirider(datei: string): void {
    this.state.dateirider = misc.dropImage(this.state.dateirider, datei);
  }

  dateirider(): string[] {
    return this.state.dateirider;
  }

  backlineJazzclub(): string[] {
    return this.state.backlineJazzclub;
  }

  backlineRockshop(): string[] {
    return this.state.backlineRockshop;
  }

  technikAngebot1(): string {
    return this.state.technikAngebot1 || '';
  }

  fluegel(): boolean {
    return this.state.fluegel;
  }

  checked(): boolean {
    return this.state.checked;
  }
}
