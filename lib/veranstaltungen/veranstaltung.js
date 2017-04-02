const moment = require('moment-timezone');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

const Artist = beans.get('artist');
const Eintrittspreise = beans.get('eintrittspreise');
const Kasse = beans.get('kasse');
const Kontakt = beans.get('kontakt');
const Kopf = beans.get('kopf');
const Kosten = beans.get('kosten');
const Staff = beans.get('staff');
const Unterkunft = beans.get('unterkunft');
const Vertrag = beans.get('vertrag');
const Werbung = beans.get('werbung');

class Veranstaltung {
  constructor(object) {
    this.state = object ? object : {};
    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kasse', 'kopf', 'kosten', 'staff',
      'unterkunft', 'vertrag', 'werbung'].forEach(field => {
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

    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kasse', 'kopf', 'kosten', 'staff',
      'unterkunft', 'vertrag', 'werbung'].forEach(field => {
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

  kasse() {
    return new Kasse(this.state.kasse);
  }

  kopf() {
    return new Kopf(this.state.kopf);
  }

  kosten() {
    return new Kosten(this.state.kosten, this.artist().numForCatering());
  }

  staff() {
    return new Staff(this.state.staff);
  }

  unterkunft() {
    return new Unterkunft(this.state.unterkunft, this.startMoment());
  }

  vertrag() {
    return new Vertrag(this.state.vertrag);
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

  kostenGesamtEUR() {
    return this.kosten().totalEUR() + this.staff().staffTotalEUR() + this.werbung().marketingTotalEUR();
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

  datumForDisplayMitKW() {
    return this.startMoment().format('LL ([KW] gg)');
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
