const moment = require('moment-timezone');

function displayWeekSpan(veranstaltungstagAsMoment, duration) {
  const bis = moment(veranstaltungstagAsMoment).subtract(1, 'weeks');
  const von = moment(veranstaltungstagAsMoment).subtract(duration, 'weeks');
  return 'KW ' + (duration > 1 ? von.weeks() + '-' : '') + bis.weeks();
}

class Werbung {
  constructor(object, veranstaltungstagAsMoment) {
    this.state = object;
    this.veranstaltungstagAsMoment = veranstaltungstagAsMoment;
  }

  fillFromUI(object) {
    ['kulturringNum', 'grueneNum', 'spitzerNum', 'ralfNum'].forEach(field => {
      this.state[field] = parseInt(object[field], 10);
    });
    ['kulturringGroesse', 'grueneGroesse', 'spitzerGroesse', 'ralfGroesse', 'genehmigt'].forEach(field => {
      this.state[field] = object[field];
    });

    return this;
  }

  kulturringNum() {
    return this.state.kulturringNum || 0;
  }

  kulturringGroesse() {
    return this.state.kulturringGroesse || 0;
  }

  kulturringKW() {
    return displayWeekSpan(this.veranstaltungstagAsMoment, 2);
  }

  grueneNum() {
    return this.state.grueneNum || 0;
  }

  grueneGroesse() {
    return this.state.grueneGroesse || 0;
  }

  grueneKW() {
    return displayWeekSpan(this.veranstaltungstagAsMoment, 1);
  }

  spitzerNum() {
    return this.state.spitzerNum || 0;
  }

  spitzerGroesse() {
    return this.state.spitzerGroesse || 0;
  }

  spitzerKW() {
    return displayWeekSpan(this.veranstaltungstagAsMoment, 1);
  }

  ralfNum() {
    return this.state.ralfNum || 0;
  }

  ralfGroesse() {
    return this.state.ralfGroesse || 0;
  }

  ralfKW() {
    return displayWeekSpan(this.veranstaltungstagAsMoment, 4);
  }

  anzahlPlakate() {
    return this.kulturringNum() + this.grueneNum() + this.spitzerNum() + this.ralfNum();
  }

  genehmigt() {
    return this.state.genehmigt;
  }
}

module.exports = Werbung;
