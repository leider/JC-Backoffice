const beans = require('simple-configure').get('beans');
const Renderer = beans.get('renderer');

class Kopf {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['beschreibung', 'eventType', 'kooperation', 'ort', 'titel', 'verantwortlicher'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  beschreibung() {
    return this.state.beschreibung;
  }

  beschreibungHTML() {
    return Renderer.render(this.beschreibung());
  }

  eventType() {
    return this.state.eventType || 'Club Konzert';
  }

  kooperation() {
    return this.state.kooperation || '';
  }

  ort() {
    return this.state.ort || 'Jubez';
  }

  titel() {
    return this.state.titel;
  }

  verantwortlicher() {
    return this.state.verantwortlicher || 'NB';
  }
}

module.exports = Kopf;
