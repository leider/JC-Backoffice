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
    ['backlineEUR', 'saalmiete', 'technikAngebot1EUR', 'gagenEUR', 'werbung1', 'werbung2', 'werbung3', 'personal'].forEach(field => {
      if (object[field]) {
        this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
      }
    });
    ['rider', 'technikJazzclub', 'technikAngebot1', 'gagenSteuer', 'deal'].forEach(field => {
      this.state[field] = object[field] || this.state[field]; // keep old value if not delivered
    });
    ['backlineJazzclub', 'backlineRockshop'].forEach(field => {
      if (object[field]) {
        this.state[field] = misc.toArray(object[field]);
      }
    });
    ['checked', 'gageBAR', 'fluegel'].forEach(field => {
      this.state[field] = object[field]; // handle undefined for checkbox
    });
    return this;
  }

  rider() {
    return this.state.rider;
  }

  updateDateirider(datei) {
    const imagePushed = misc.pushImage(this.state.dateirider, datei);
    if (imagePushed) {
      this.state.dateirider = imagePushed;
      return true;
    }
    return false;
  }

  removeDateirider(datei) {
    this.state.dateirider = misc.dropImage(this.state.dateirider, datei);
  }

  dateirider() {
    return this.state.dateirider || [];
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

  saalmiete() {
    return this.state.saalmiete || 0;
  }

  technikJazzclub() {
    return this.state.technikJazzclub;
  }

  technikAngebot1() {
    return this.state.technikAngebot1;
  }

  fluegel() {
    return this.state.fluegel;
  }

  technikAngebot1EUR() {
    return this.state.technikAngebot1EUR || 0;
  }

  werbung1() {
    return this.state.werbung1 || 0;
  }

  werbung2() {
    return this.state.werbung2 || 0;
  }

  werbung3() {
    return this.state.werbung3 || 0;
  }

  personal() {
    return this.state.personal || 0;
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

  gagenTotalEURformatted() {
    return fieldHelpers.formatNumberTwoDigits(this.gagenTotalEUR());
  }

  deal() {
    return this.state.deal;
  }

  dealAlsFaktor() {
    return floatAmount(this.deal()) / 100;
  }

  bandTotalEUR() {
    return this.gagenTotalEUR();
  }

  backlineUndTechnikEUR() {
    return this.backlineEUR() + this.technikAngebot1EUR();
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
