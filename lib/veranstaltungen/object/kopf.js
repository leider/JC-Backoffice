const beans = require('simple-configure').get('beans');
const Renderer = beans.get('renderer');

class Kopf {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    [
      'beschreibung',
      'eventTyp',
      'flaeche',
      'kooperation',
      'ort',
      'titel',
      'verantwortlicher',
      'pressename',
      'presseIn',
      'genre'
    ].forEach(field => {
      this.state[field] = object[field] || this.state[field];
    });
    this.state.confirmed = object.confirmed === 'on';
    this.state.rechnungAnKooperation = object.rechnungAnKooperation === 'on';
    return this;
  }

  beschreibung() {
    return this.state.beschreibung;
  }

  beschreibungHTML() {
    return Renderer.render(this.beschreibung());
  }

  confirmed() {
    return this.state.confirmed || this.state.confirmed === undefined;
  }

  eventTyp() {
    return this.state.eventTyp;
  }

  genre() {
    return this.state.genre;
  }

  kooperation() {
    return this.state.kooperation || '_';
  }

  isKooperation() {
    return !!this.kooperation && this.kooperation() !== '_';
  }

  rechnungAnKooperation() {
    return this.state.rechnungAnKooperation === undefined
      ? this.isKooperation()
      : this.state.rechnungAnKooperation;
  }

  ort() {
    return this.state.ort || 'Jubez';
  }

  flaeche() {
    return this.state.flaeche || 0;
  }

  pressename() {
    return this.state.pressename || this.ort();
  }

  presseIn() {
    return this.state.presseIn || this.pressename();
  }

  titel() {
    return this.state.titel;
  }

  verantwortlicher() {
    return this.state.verantwortlicher || 'NB';
  }
}

module.exports = Kopf;
