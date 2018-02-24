const moment = require('moment-timezone');

const config = require('simple-configure');
const beans = config.get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const Renderer = beans.get('renderer');

const Artist = beans.get('artist');
const Eintrittspreise = beans.get('eintrittspreise');
const Kasse = beans.get('kasse');
const Kontakt = beans.get('kontakt');
const Kopf = beans.get('kopf');
const Kosten = beans.get('kosten');
const Presse = beans.get('presse');
const Staff = beans.get('staff');
const Unterkunft = beans.get('unterkunft');
const Vertrag = beans.get('vertrag');
const Werbung = beans.get('werbung');

class Veranstaltung {
  constructor(object) {
    this.state = object ? object : {};
    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kasse', 'kopf', 'kosten', 'presse',
      'staff', 'unterkunft', 'vertrag', 'werbung'].forEach(field => {
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
      if (object.startDate) {
        this.state.url = object.url;
        this.state.reservixID = object.reservixID;
        this.state.startDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.startDate, object.startTime).toDate();
        this.state.endDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.endDate, object.endTime).toDate();
        this.state.id = object.id || (object.kopf.titel + ' am ' + this.datumForDisplay());
      }
    }

    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kasse', 'kopf', 'kosten', 'presse',
      'staff', 'unterkunft', 'vertrag', 'werbung'].forEach(field => {
      if (object[field]) {
        this[field]().fillFromUI(object[field]);
      }
    });
    return this;
  }

  reset() {
    /*eslint no-underscore-dangle: 0 */
    delete this.state._id;
    this.state.id = this.state.id + 'copy';
    this.state.url = this.state.url + 'copy';
    delete this.state.startDate;
    delete this.state.endDate;
  }

  associateSalesreport(salesreport) {
    this.salesrep = salesreport;
  }

  salesreport() {
    return this.salesrep;
  }

  fullyQualifiedUrl() {
    return '/veranstaltungen/' + encodeURIComponent(this.url());
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
    return new Kosten(this.state.kosten);
  }

  presse() {
    return new Presse(this.state.presse);
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
    return new Werbung(this.state.werbung);
  }

  // end subobjects

  id() {
    return this.state.id;
  }

  url() {
    return this.state.url || '';
  }

  reservixID() {
    return this.state.reservixID;
  }

  startDate() {
    return this.state.startDate || moment().hours(20).minutes(0).toDate();
  }

  endDate() {
    return this.state.endDate || this.startMoment().add(3, 'hours').toDate();
  }

  // Money - GEMA - Reservix

  kostenGesamtEUR() {
    return this.kosten().totalEUR() + this.staff().staffTotalEUR() + this.werbung().marketingTotalEUR() + this.unterkunft().kostenTotalEUR();
  }

  reservixBrutto() {
    return this.salesreport() ? this.salesreport().bruttoUmsatz() : 0;
  }

  reservixAnzahl() {
    return this.salesreport() ? this.salesreport().anzahlRegulaer() : 0;
  }

  reservixNettoEUR() {
    if (this.reservixBrutto() <= 0) {
      return 0;
    }
    const ohneSteuer = this.reservixBrutto() / 1.19;
    return (ohneSteuer - this.reservixAnzahl() * config.get('reservix-gebuehr')) * (1 - config.get('reservix-vvk')); // gebuehr in EUR an reservix und vvk an VVK-Stelle
  }

  einnahmenGesamtEUR() {
    return this.kasse().einnahmenNettoEUR() + this.reservixBrutto() + this.eintrittspreise().zuschuss();
  }

  dealAbsolutEUR() {
    const deal = this.bruttoUerberschussEUR() * this.kosten().dealAlsFaktor();
    return deal > 0 ? deal : 0;
  }

  bruttoUerberschussEUR() {
    return this.einnahmenGesamtEUR() - this.kostenGesamtEUR();
  }

  einnahmenEintrittEUR() {
    return this.kasse().reservixBruttoEUR() + this.kasse().einnahmeTicketsEUR();
  }

  anzahlBesucher() {
    return this.kasse().anzahlBesucherAK() + this.kasse().anzahlBesucherReservix();
  }

  // Display Dates and Times

  month() {
    return this.startMoment().month();
  }

  year() {
    return this.startMoment().year();
  }

  datumForDisplayShort() {
    return this.startMoment().format('dd. DD.MM.YY');
  }

  datumForDisplay() {
    return this.startMoment().format('LL');
  }

  datumForDisplayMitKW() {
    return this.startMoment().format('LL ([KW] ww)');
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

  // utility
  presseTemplate() {
    return '### ' + this.kopf().titel() + '\n#### ' + this.startMoment().format('dddd, Do MMMM YYYY [um] k:mm') + ' &ndash; ' + this.kopf().ort() + '\n\n';
  }

  presseTemplateInternal() {
    '[Linkbeschreibung](http://ddddd)'
    return '### [' + this.kopf().titel() + '](' + config.get('publicUrlPrefix') + this.fullyQualifiedUrl() +
      '/presse)\n#### ' + this.startMoment().format('dddd, Do MMMM YYYY [um] k:mm') + ' &ndash; ' + this.kopf().ort() + '\n\n';
  }

  presseTextHTML(optionalText) {
    return Renderer.render(this.presseTemplate() + (optionalText || this.presse().text()));
  }

  presseTextForMail() {
    return this.presseTemplate() + this.presse().text() + '\n\n' + (this.presse().firstImage() && this.presse().imageURL());
  }

  description() {
    return this.datumForDisplayMitKW() + ' <b>' + this.kopf().titel() + '</b>';
  }

  preisAusweisGema() {
    if (this.eintrittspreise().frei()) {
      return 'freier Eintritt';
    }
    if (this.kopf().kooperation() !== '_') {
      return 'Kooperation mit: ' + this.kopf().kooperation();
    }
    return fieldHelpers.formatNumberTwoDigits(this.eintrittspreise().regulaer()) + ' €';
  }

  eintrittGema() {
    return fieldHelpers.formatNumberTwoDigits(this.einnahmenEintrittEUR()) + ' €';
  }

  tooltipInfos() {
    return this.kopf().ort() + this.staff().tooltipInfos();
  }

  // Mailsend check
  isSendable() {
    return this.presse().checked() && this.kopf().confirmed();
  }
}

module.exports = Veranstaltung;
