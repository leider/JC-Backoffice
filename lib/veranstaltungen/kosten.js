const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

function floatAmount(textWithNumberOrNull) {
  return (textWithNumberOrNull && parseFloat(textWithNumberOrNull.replace(',', '.'), 10)) || 0;
}

class Kosten {
  constructor(object) {
    this.state = object || {};
    ['backlineJazzclub', 'backlineRockshop'].forEach(field => {
      this.state[field] = object[field] || [];
    });
  }

  fillFromUI(object) {
    ['backlineEUR', 'saalmiete', 'technikAngebot1EUR', 'technikAngebot2EUR', 'gagenEUR',
      'agenturEUR'].forEach(field => {
      if (object[field]) {
        this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
      }
    });
    ['rider', 'saal', 'technikJazzclub', 'technikAngebot1',
      'technikAngebot2', 'gagenSteuer', 'deal', 'agenturSteuer'].forEach(field => {
      this.state[field] = object[field] || this.state[field]; // keep old value if not delivered
    });
    ['backlineJazzclub', 'backlineRockshop'].forEach(field => {
      if (object[field]) {
        this.state[field] = misc.toArray(object[field]);
      }
    });
    ['checked', 'gageBAR'].forEach(field => {
      this.state[field] = object[field]; // handle undefined for checkbox
    });
    return this;
  }

  rider() {
    return this.state.rider;
  }

  updateDateirider(name) {
    this.state.dateirider = name;
  }

  dateirider() {
    return this.state.dateirider;
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

  gagenSteuer() {
    return this.state.gagenSteuer;
  }

  gagenTotalEUR() {
    const eur = this.gagenEUR();
    const mwst = eur * floatAmount(this.gagenSteuer()) / 100;
    return eur + mwst;
  }

  agenturTotalEUR() {
    const eur = this.agenturEUR();
    const mwst = eur * floatAmount(this.agenturSteuer()) / 100;
    return eur + mwst;
  }

  deal() {
    return this.state.deal;
  }

  dealAlsFaktor() {
    return floatAmount(this.deal()) / 100;
  }

  agenturEUR() {
    return this.state.agenturEUR || 0;
  }

  agenturSteuer() {
    return this.state.agenturSteuer;
  }

  bandTotalEUR() {
    return this.gagenTotalEUR() + this.agenturTotalEUR();
  }

  backlineUndTechnikEUR() {
    return this.backlineEUR() + this.technikAngebot1EUR() + this.technikAngebot2EUR();
  }

  totalEUR() {
    return this.bandTotalEUR() + this.backlineUndTechnikEUR() + this.saalmiete();
  }

  checked() {
    return this.state.checked;
  }

  gageBAR() {
    return this.state.gageBAR;
  }
}

module.exports = Kosten;
