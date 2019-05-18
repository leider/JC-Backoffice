const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

function floatAmount(textWithNumberOrNull) {
  return (
    (textWithNumberOrNull &&
      parseFloat(textWithNumberOrNull.replace(',', '.'), 10)) ||
    0
  );
}

class Kosten {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    [
      'backlineEUR',
      'saalmiete',
      'technikAngebot1EUR',
      'gagenEUR',
      'werbung1',
      'werbung2',
      'werbung3',
      'personal'
    ].forEach(field => {
      if (object[field]) {
        this.state[field] = parseFloat(object[field]);
      }
    });
    ['gagenSteuer', 'deal'].forEach(field => {
      this.state[field] = object[field] || this.state[field]; // keep old value if not delivered
    });
    ['gageBAR'].forEach(field => {
      this.state[field] = object[field]; // handle undefined for checkbox
    });
    return this;
  }

  backlineEUR() {
    return this.state.backlineEUR || 0;
  }

  saalmiete() {
    return this.state.saalmiete || 0;
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
    const mwst = (eur * floatAmount(this.gagenSteuer())) / 100;
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

  backlineUndTechnikEUR() {
    return this.backlineEUR() + this.technikAngebot1EUR();
  }

  totalEUR() {
    return (
      this.gagenTotalEUR() +
      this.backlineUndTechnikEUR() +
      this.saalmiete() +
      this.werbung1() +
      this.werbung2() +
      this.werbung3() +
      this.personal()
    );
  }

  gageBAR() {
    return this.state.gageBAR;
  }
}

module.exports = Kosten;
