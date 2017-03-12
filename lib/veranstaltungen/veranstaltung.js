const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const Eintrittspreise = beans.get('eintrittspreise');
const Kontakt = beans.get('kontakt');
const Kosten = beans.get('kosten');
const Werbung = beans.get('werbung');
const Staff = beans.get('staff');
const Kopf = beans.get('kopf');
const Artist = beans.get('artist');
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
    }

    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kopf', 'kosten', 'staff',
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

  artist() {
    return new Artist(this.state.artist);
  }

  eintrittspreise() {
    return new Eintrittspreise(this.state.eintrittspreise);
  }

  hotel() {
    return new Kontakt(this.state.hotel);
  }

  kopf() {
    return new Kopf(this.state.kopf);
  }

  kosten() {
    return new Kosten(this.state.kosten);
  }

  staff() {
    return new Staff(this.state.staff);
  }

  unterkunft() {
    return new Unterkunft(this.state.unterkunft, this.startMoment());
  }

  werbung() {
    return new Werbung(this.state.werbung, this.startMoment());
  }

  // end subobjects

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
