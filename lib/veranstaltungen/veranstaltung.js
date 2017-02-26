const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const Eintrittspreise = beans.get('eintrittspreise');
const Kontakt = beans.get('kontakt');

class Veranstaltung {
  /* eslint no-underscore-dangle: 0 */
  constructor(object) {
    this.state = object ? object : {};
    if (!this.state.eintrittspreise) {
      this.state.eintrittspreise = {};
    }
    if (!this.state.kontakt) {
      this.state.kontakt = {};
    }
  }

  fullyQualifiedUrl() {
    return '/veranstaltungen/' + this.startMoment().year() + '/' + this.url();
  }

  eintrittspreise() {
    return new Eintrittspreise(this.state.eintrittspreise);
  }

  kontakt() {
    return new Kontakt(this.state.kontakt);
  }

  id() {
    return this.state.id;
  }

  eventType() {
    return this.state.eventType || 'Club Konzert';
  }

  ort() {
    return this.state.ort || 'Jubez';
  }

  kooperation() {
    return this.state.kooperation || '';
  }

  verantwortlicher() {
    return this.state.verantwortlicher || 'NB';
  }

  titel() {
    return this.state.titel || 'Ohne Namen';
  }

  beschreibung() {
    return this.state.beschreibung || '';
  }

  url() {
    return this.state.url || '';
  }

  startDate() {
    return this.state.startDate || moment().hours(20).minutes(0).toDate();
  }

  endDate() {
    return this.state.endDate || this.startMoment().add(3, 'hours').toDate();
  }

  fillFromUI(object) {
    this.state.url = object.url;

    this.state.startDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.startDate, object.startTime).toDate();
    this.state.endDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.endDate, object.endTime).toDate();

    this.state.eventTyp = object.eventTyp || this.state.eventTyp;
    this.state.koop = object.koop || this.state.koop;
    this.state.ort = object.ort || this.state.ort;
    this.state.titel = object.titel || this.state.titel;
    this.state.verantwortlicher = object.verantwortlicher || this.state.verantwortlicher;

    this.eintrittspreise().fillFromUI(object.eintrittspreise);
    this.kontakt().fillFromUI(object.kontakt);
    this.state.id = object.id || object.titel + ' am ' + this.datumForDisplay();

    return this;
  }

  resetForClone() {
    const result = new Veranstaltung();
    result.state.startDate = this.startDate();
    result.state.endDate = this.endDate();
    return result;
  }

  // Display Dates and Times

  month() {
    return this.startMoment().month();
  }

  year() {
    return this.startMoment().year();
  }

  datumForDisplay() {
    return this.startMoment().format('LL');
  }

  startMoment() {
    return moment(this.startDate());
  }

  minimalStartForEdit() {
    return this.startMoment().isBefore(moment()) ? this.startMoment() : moment();
  }

  endMoment() {
    return moment(this.endDate());
  }
}

module.exports = Veranstaltung;
