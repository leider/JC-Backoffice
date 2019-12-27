import misc from '../../commons/misc';
import fieldHelpers from '../../commons/fieldHelpers';

export default class Artist {
  state!: any;

  constructor(object: any) {
    this.state = object || {};
  }

  fillFromUI(object: any) {
    ['bandname'].forEach(field => {
      this.state[field] = object[field];
    });
    ['name'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['numMusiker', 'numCrew'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(
        object[field]
      );
    });
    ['isBawue', 'isAusland', 'brauchtHotel'].forEach(field => {
      this.state[field] = !!object[field];
    });
    return this;
  }

  isAusland() {
    return this.state.isAusland;
  }

  isBawue() {
    return this.state.isBawue;
  }

  brauchtHotel() {
    return !!this.state.brauchtHotel;
  }

  bandname() {
    return this.state.bandname;
  }

  name() {
    return misc.toArray(this.state.name); // legacy, was text before
  }

  numMusiker() {
    return this.state.numMusiker || 1;
  }

  numCrew() {
    return this.state.numCrew || 0;
  }

  numForCatering() {
    return this.numMusiker() + this.numCrew();
  }
}
