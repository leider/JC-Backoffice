const moment = require('moment-timezone');

const config = require('simple-configure');
const beans = config.get('beans');
const fieldHelpers = beans.get('fieldHelpers');

class Termin {
  constructor(object) {
    this.state = object ? object : {};
    if (!this.state.typ) {
      this.state.typ = Termin.typen()[0];
    }
  }

  static typen() {
    return [
      'Sonstiges',
      'Feiertag',
      'Ferien'
    ];
  }

  static colorForType(typ) {
    return {
      Sonstiges: '#d6bdff',
      Feiertag: '#c1c3ff',
      Ferien: '#c1c3ff'
    }[typ];
  }

  fillFromUI(object) {
    this.state.startDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.startDate).toDate();
    this.state.endDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.endDate, '12:00').toDate();
    this.state.id = object.id || moment().toString();
    this.state.beschreibung = object.beschreibung;
    this.state.typ = object.typ || Termin.typen()[0];
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

  typ() {
    return this.state.typ;
  }

  asEvent() {
    return {
      color: Termin.colorForType(this.typ()),
      start: this.startMoment().format(),
      end: this.endMoment().format(),
      title: this.beschreibung(),
      tooltip: this.beschreibung()
    };
  }

}

module.exports = Termin;
