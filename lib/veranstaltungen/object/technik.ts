import misc from '../../commons/misc';

export default class Technik {
  state: any;
  constructor(object: any) {
    this.state = object || {};
    ['backlineJazzclub', 'backlineRockshop'].forEach(field => {
      this.state[field] = object[field] || [];
    });
  }

  fillFromUI(object: any) {
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

  updateDateirider(datei: string) {
    const imagePushed = misc.pushImage(this.state.dateirider, datei);
    if (imagePushed) {
      this.state.dateirider = imagePushed;
      return true;
    }
    return false;
  }

  removeDateirider(datei: string) {
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
