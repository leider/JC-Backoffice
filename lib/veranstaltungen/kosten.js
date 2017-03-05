const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Kosten {
  constructor(object) {
    this.state = object;
    if (!this.state.backlineRockshop) {
      this.state.backlineRockshop = [];
    }
    if (!this.state.backlineRockshop) {
      this.state.backlineRockshop = [];
    }
  }

  fillFromUI(object) {
    ['backlineEUR', 'saalmiete', 'technikAngebot1EUR', 'technikAngebot2EUR', 'gagenEUR',
      'agenturEUR', 'cateringEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['rider', 'backlineJazzclub', 'backlineRockshop', 'saal', 'technikJazzclub', 'technikAngebot1',
      'technikAngebot2', 'gagenMWSt', 'gagenAuslandSt', 'deal', 'agenturMWSt'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  rider() {
    return this.state.rider;
  }

  backlineJazzclub() {
    return this.state.backlineJazzclub;
  }

  backlineRockshop() {
    return this.state.backlineRockshop;
  }

  backlineEUR() {
    return this.state.backlineEUR || 0;
  }

  saal() {
    return this.state.saal;
  }

  saalmiete() {
    return this.state.saalmiete || 0;
  }

  technikJazzclub() {
    return this.state.technikJazzclub;
  }

  technikAngebot1() {
    return this.state.technikAngebot1;
  }

  technikAngebot2() {
    return this.state.technikAngebot2;
  }

  technikAngebot1EUR() {
    return this.state.technikAngebot1EUR || 0;
  }

  technikAngebot2EUR() {
    return this.state.technikAngebot2EUR || 0;
  }

  gagenEUR() {
    return this.state.gagenEUR || 0;
  }

  gagenMWSt() {
    return this.state.gagenMWSt;
  }

  gagenAuslandSt() {
    return this.state.gagenAuslandSt;
  }

  deal() {
    return this.state.deal;
  }

  agenturEUR() {
    return this.state.agenturEUR || 0;
  }

  agenturMWSt() {
    return this.state.agenturMWSt;
  }

  cateringEUR() {
    return this.state.cateringEUR || 0;
  }

}

module.exports = Kosten;
