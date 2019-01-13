const beans = require('simple-configure').get('beans');
const misc = beans.get('misc');

class Technik {
  constructor(object) {
    this.state = object || {};
    ['backlineJazzclub', 'backlineRockshop'].forEach(field => {
      this.state[field] = object[field] || [];
    });
  }

  fillFromUI(object) {
    ['rider', 'technikJazzclub', 'technikAngebot1'].forEach(field => {
      this.state[field] = object[field] || this.state[field]; // keep old value if not delivered
    });
    ['backlineJazzclub', 'backlineRockshop'].forEach(field => {
      if (object[field]) {
        this.state[field] = misc.toArray(object[field]);
      }
    });
    ['checked', 'fluegel'].forEach(field => {
      this.state[field] = object[field] === 'on'; // handle undefined for checkbox
    });
    return this;
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

  technikJazzclub() {
    return this.state.technikJazzclub;
  }

  technikAngebot1() {
    return this.state.technikAngebot1;
  }

  fluegel() {
    return this.state.fluegel;
  }

  checked() {
    return this.state.checked;
  }
}

module.exports = Technik;
