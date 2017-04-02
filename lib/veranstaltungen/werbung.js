const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Werbung {
  constructor(object, veranstaltungstagAsMoment) {
    this.state = object || {};
    this.veranstaltungstagAsMoment = veranstaltungstagAsMoment;
  }

  fillFromUI(object) {
    ['plakat1EUR', 'plakat2EUR', 'flyerEUR', 'layoutingEUR', 'genehmigungenEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['plakat1Num', 'plakat2Num', 'flyerNum', 'genehmigungenNum'].forEach(field => {
      this.state[field] = parseInt(object[field], 10);
    });
    ['plakat1KW', 'plakat2KW', 'plakat1Groesse', 'plakat2Groesse', 'flyerInfo', 'layoutingInfo', 'genehmigungenInfo', 'genehmigt'].forEach(field => {
      this.state[field] = object[field];
    });

    return this;
  }

  plakat1Num() {
    return this.state.plakat1Num || 0;
  }

  plakat1Von() {
    return this.state.plakat1Von || 0;
  }

  plakat1Groesse() {
    return this.state.plakat1Groesse || 0;
  }

  plakat1EUR() {
    return this.state.plakat1EUR || 0;
  }

  plakat1KW() {
    return this.state.plakat1KW || 0;
  }

  plakat2Num() {
    return this.state.plakat2Num || 0;
  }

  plakat2Von() {
    return this.state.plakat2Von || 0;
  }

  plakat2Groesse() {
    return this.state.plakat2Groesse || 0;
  }

  plakat2EUR() {
    return this.state.plakat2EUR || 0;
  }

  plakat2KW() {
    return this.state.plakat2KW || 0;
  }

  anzahlPlakate() {
    return 0;
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

  flyerInfo() {
    return this.state.flyerInfo;
  }

  genehmigungenNum() {
    return this.state.genehmigungenNum || 0;
  }

  genehmigungenEUR() {
    return this.state.genehmigungenEUR || 0;
  }

  genehmigungenInfo() {
    return this.state.genehmigungenInfo;
  }

  layoutingEUR() {
    return this.state.layoutingEUR || 25;
  }

  layoutingInfo() {
    return this.state.layoutingInfo;
  }

  plakateTotalEUR() {
    return this.plakat1EUR() + this.plakat2EUR() + this.genehmigungenEUR();
  }

  mediaTotalEUR() {
    return this.flyerEUR() + this.layoutingEUR();
  }

  marketingTotalEUR() {
    return this.plakateTotalEUR() + this.mediaTotalEUR();
  }
}

module.exports = Werbung;
