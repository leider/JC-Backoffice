const beans = require('simple-configure').get('beans');
const Renderer = beans.get('renderer');

class Kopf {

  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['beschreibung', 'eventTyp', 'flaeche', 'kooperation', 'ort', 'titel',
      'verantwortlicher', 'pressename', 'presseIn'].forEach(field => {
      this.state[field] = object[field] ? object[field] : this.state[field];
    });
    this.state.confirmed = object.confirmed === 'on' || false;
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

  cssColorCode() {
    if (this.eventTyp() === 'Soulcafé') {
      return 'soulcafe';
    }
    if (this.eventTyp() === 'JazzClassix') {
      return 'classix';
    }
    if (this.eventTyp() === 'Session I') {
      return 'session';
    }
    if (this.eventTyp() === 'JazzFestival') {
      return 'festival';
    }
    return 'concert';
  }

  cssIconClass() {
    if (this.eventTyp() === 'Soulcafé') {
      return 'flaticon-play text-' + this.cssColorCode();
    }
    if (this.eventTyp() === 'JazzClassix') {
      return 'flaticon-music-1 text-' + this.cssColorCode();
    }
    if (this.eventTyp() === 'Session I') {
      return 'flaticon-people text-' + this.cssColorCode();
    }
    if (this.eventTyp() === 'JazzFestival') {
      return 'logo-festival';
    }
    return 'flaticon-null text-' + this.cssColorCode();
  }

  eventTyp() {
    return this.state.eventTyp || 'Club Konzert';
  }

  kooperation() {
    return this.state.kooperation || '_';
  }

  isKooperation() {
    return !!this.kooperation;
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
