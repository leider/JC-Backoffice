import misc from '../../commons/misc';

export default class Vertrag {
  state: any;

  static arten() {
    return ['Jazzclub', 'Agentur/Künstler', 'JazzClassix'];
  }

  constructor(object: any) {
    this.state = object || {};
  }

  fillFromUI(object: any) {
    ['art', 'sprache'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  art() {
    return this.state.art || 'noch nicht gewählt';
  }

  updateDatei(datei: string) {
    const imagePushed = misc.pushImage(this.state.datei, datei);
    if (imagePushed) {
      this.state.datei = imagePushed;
      return true;
    }
    return false;
  }

  removeDatei(datei: string) {
    this.state.datei = misc.dropImage(this.state.datei, datei);
  }

  datei() {
    return this.state.datei || [];
  }

  sprache() {
    return this.state.sprache || 'Deutsch';
  }
}
