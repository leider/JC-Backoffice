const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const Eintrittspreise = beans.get('eintrittspreise');
const Kontakt = beans.get('kontakt');
const Kosten = beans.get('kosten');
const Werbung = beans.get('werbung');
const Staff = beans.get('staff');
const Unterkunft = beans.get('unterkunft');

class Veranstaltung {
  constructor(object) {
    this.state = object ? object : {};
    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kopf', 'kosten', 'staff',
      'unterkunft', 'werbung'].forEach(field => {
      this.state[field] = this.state[field] || {};
    });
  }

  fillFromUI(object) {
    if (!object.kopf && !object.id) {
      return;
    }

    if (object.id) {
      this.state.id = object.id;
    }

    if (object.kopf) {
      this.state.url = object.url;

      this.state.startDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.startDate, object.startTime).toDate();
      this.state.endDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.endDate, object.endTime).toDate();
      this.state.id = object.id || (object.titel + ' am ' + this.datumForDisplay());

      this.state.kopf = object.kopf;
    }

    if (object.artist) {
      this.state.artist = object.artist;
    }

    ['agentur', 'eintrittspreise', 'hotel', 'kosten', 'staff',
      'unterkunft', 'werbung'].forEach(field => {
      if (object[field]) {
        this[field]().fillFromUI(object[field]);
      }
    });
    return this;
  }

  fullyQualifiedUrl() {
    return '/veranstaltungen/' + this.url();
  }

  // subobjects

  agentur() {
    return new Kontakt(this.state.agentur);
  }

  eintrittspreise() {
    return new Eintrittspreise(this.state.eintrittspreise);
  }

  hotel() {
    return new Kontakt(this.state.hotel);
  }

  kosten() {
    return new Kosten(this.state.kosten);
  }

  staff() {
    return new Staff(this.state.staff);
  }

  unterkunft() {
    return new Unterkunft(this.state.unterkunft);
  }

  werbung() {
    return new Werbung(this.state.werbung, this.startMoment());
  }

  // end subobjects

  // kopf

  eventType() {
    return this.state.kopf.eventType || 'Club Konzert';
  }

  ort() {
    return this.state.kopf.ort || 'Jubez';
  }

  kooperation() {
    return this.state.kopf.kooperation || '';
  }

  verantwortlicher() {
    return this.state.kopf.verantwortlicher || 'NB';
  }

  titel() {
    return this.state.kopf.titel;
  }

  beschreibung() {
    return this.state.kopf.beschreibung;
  }

  // end kopf

  // artist stuff

  artistName() {
    return this.state.artist.name;
  }

  numMusiker() {
    return this.state.artist.numMusiker || 1;
  }

  numCrew() {
    return this.state.artist.numCrew || 0;
  }

  numForCatering() {
    return parseInt(this.numMusiker(), 10) + parseInt(this.numCrew(), 10);
  }

  artistIsBawue() {
    return this.state.artist.isBawue;
  }

  artistIsAusland() {
    return this.state.artist.isAusland;
  }

  // end of artist stuff

  id() {
    return this.state.id;
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

  istVergangen() {
    return this.startMoment().isBefore(moment());
  }
}

module.exports = Veranstaltung;
