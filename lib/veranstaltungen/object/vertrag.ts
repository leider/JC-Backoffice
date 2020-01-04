import misc from '../../commons/misc';

export type Sprache = 'Deutsch' | 'Englisch' | 'Regional';
export type Vertragsart = 'Jazzclub' | 'Agentur/Künstler' | 'JazzClassix';

export interface VertragRaw {
  art: Vertragsart;
  sprache: Sprache;
  datei: string[];
}

export default class Vertrag {
  state: VertragRaw;

  static arten(): Vertragsart[] {
    return ['Jazzclub', 'Agentur/Künstler', 'JazzClassix'];
  }

  toJSON(): VertragRaw {
    return this.state;
  }

  constructor(object: VertragRaw | undefined) {
    this.state = object || {
      art: 'Jazzclub',
      sprache: 'Deutsch',
      datei: []
    };
    if (!this.state.datei) {
      this.state.datei = [];
    }
  }

  fillFromUI(object: VertragRaw): Vertrag {
    this.state.art = object.art;
    this.state.sprache = object.sprache;
    return this;
  }

  art(): Vertragsart {
    return this.state.art;
  }

  updateDatei(datei: string): boolean {
    const imagePushed = misc.pushImage(this.state.datei, datei);
    if (imagePushed) {
      this.state.datei = imagePushed;
      return true;
    }
    return false;
  }

  removeDatei(datei: string): void {
    this.state.datei = misc.dropImage(this.state.datei, datei);
  }

  datei(): string[] {
    return this.state.datei;
  }

  sprache(): string {
    return this.state.sprache;
  }
}
