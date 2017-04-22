const beans = require('simple-configure').get('beans');
const Renderer = beans.get('renderer');

class Kopf {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['beschreibung', 'eventTyp', 'kooperation', 'ort', 'titel', 'verantwortlicher'].forEach(field => {
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

  cssIconClass() {
    if (this.eventTyp() === 'Soulcafé') {
      return 'flaticon-play text-soulcafe';
    }
    if (this.eventTyp() === 'JazzClassix') {
      return 'flaticon-music-1 text-classix';
    }
    if (this.eventTyp() === 'Session I') {
      return 'flaticon-people text-session';
    }
    return 'flaticon-null text-concert';
  }

  eventTyp() {
    return this.state.eventTyp || 'Club Konzert';
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
