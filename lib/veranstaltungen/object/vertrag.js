const beans = require('simple-configure').get('beans');
// const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

const steps = {
  'noch nicht gewählt': [],
  'Jazzclub': ['erstellt', 'Rider akzeptiert', 'versendet', 'abgeschlossen'],
  'Agentur/Künstler': ['erhalten', 'geprüft', 'geändert', 'Rider akzeptiert', 'akzeptiert', 'abgeschlossen'],
  'JazzClassix': ['Rider akzeptiert']
};

class Vertrag {
  static arten() {
    return ['Jazzclub', 'Agentur/Künstler', 'JazzClassix'];
  }

  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['art', 'sprache', 'riderGeprueftDurch'].forEach(field => {
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

  checkStep(stepname) {
    this.state[stepname] = true;
  }

  uncheckStep(stepname) {
    delete this.state[stepname];
  }

  isChecked(stepname) {
    return !!this.state[stepname];
  }

  riderGeprueftDurch() {
    return this.state.riderGeprueftDurch;
  }

  sprache() {
    return this.state.sprache || 'Deutsch';
  }

  workflow() {
    return steps[this.art()];
  }
}

module.exports = Vertrag;