const moment = require('moment-timezone');

const config = require('simple-configure');
const beans = config.get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Termin {
  constructor(object) {
    this.state = object ? object : {};
  }

  fillFromUI(object) {
    this.state.startDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.startDate).toDate();
    this.state.endDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.endDate).toDate();
    this.state.id = object.id || moment().toString();
    this.state.beschreibung = object.beschreibung;
    return this;
  }

  id() {
    return this.state.id;
  }

  beschreibung() {
    return this.state.beschreibung;
  }

  startMoment() {
    return moment(this.startDate());
  }

  endMoment() {
    return moment(this.endDate());
  }

  startDate() {
    return this.state.startDate || moment().toDate();
  }

  endDate() {
    return this.state.endDate || this.startDate();
  }

}

module.exports = Termin;
