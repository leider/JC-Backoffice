const moment = require('moment-timezone');
const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

function displayWeekSpan(veranstaltungstagAsMoment, duration) {
  const bis = moment(veranstaltungstagAsMoment).subtract(1, 'weeks');
  const von = moment(veranstaltungstagAsMoment).subtract(duration, 'weeks');
  return 'KW ' + (duration > 1 ? von.weeks() + '-' : '') + bis.weeks();
}

class Werbung {
  constructor(object, veranstaltungstagAsMoment) {
    this.state = object || {};
    this.veranstaltungstagAsMoment = veranstaltungstagAsMoment;
  }

  fillFromUI(object) {
    ['flyerEUR', 'bannerEUR', 'socialmediaEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['kulturringNum', 'grueneNum', 'spitzerNum', 'ralfNum', 'flyerNum', 'bannerNum', 'socialmediaNum'].forEach(field => {
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

  flyerNum() {
    return this.state.flyerNum || 0;
  }

  flyerEUR() {
    return this.state.flyerEUR || 0;
  }

  bannerNum() {
    return this.state.bannerNum || 0;
  }

  bannerEUR() {
    return this.state.bannerEUR || 0;
  }

  socialmediaNum() {
    return this.state.socialmediaNum || 0;
  }

  socialmediaEUR() {
    return this.state.socialmediaEUR || 0;
  }

  plakateTotal() {
    return this.kulturringNum() + this.spitzerNum() + this.grueneNum() + this.ralfNum();
  }

  plakattypEUR(plakattyp) {
    const groessenUndFaktoren = {
      kulturring: {A1: 1.5, A2: 1},
      gruene: {A1: 7.5},
      spitzer: {A1: 3.5},
      ralf: {A3: 1}
    };
    return groessenUndFaktoren[plakattyp][this[plakattyp + 'Groesse']()] * this[plakattyp + 'Num']();
  }

  plakateTotalEUR() {
    return ['kulturring', 'gruene', 'spitzer', 'ralf'].reduce(
      (sum, each) => sum + this.plakattypEUR(each),
      0);
  }

  mediaTotalEUR() {
    return ['flyer', 'banner', 'socialmedia'].reduce(
      (sum, each) => sum + this[each + 'Num']() * this[each + 'EUR'](),
    0);
  }

  marketingTotalEUR() {
    return this.plakateTotalEUR() + this.mediaTotalEUR();
  }
}

module.exports = Werbung;
