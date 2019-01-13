const beans = require('simple-configure').get('beans');
const misc = beans.get('misc');

class Vertrag {
  static arten() {
    return ['Jazzclub', 'Agentur/Künstler', 'JazzClassix'];
  }

  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['art', 'sprache'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  art() {
    return this.state.art || 'noch nicht gewählt';
  }

  updateDatei(datei) {
    const imagePushed = misc.pushImage(this.state.datei, datei);
    if (imagePushed) {
      this.state.datei = imagePushed;
      return true;
    }
    return false;
  }

  removeDatei(datei) {
    this.state.datei = misc.dropImage(this.state.datei, datei);
  }

  datei() {
    return this.state.datei || [];
  }

  sprache() {
    return this.state.sprache || 'Deutsch';
  }

}

module.exports = Vertrag;
