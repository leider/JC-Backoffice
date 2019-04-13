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
const Technik = beans.get('technik');
const Unterkunft = beans.get('unterkunft');
const Vertrag = beans.get('vertrag');
const Salesreport = beans.get('salesreport');

class Veranstaltung {
  constructor(object) {
    this.state = object ? object : {};
    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kasse', 'kopf', 'kosten', 'presse',
      'staff', 'technik', 'unterkunft', 'vertrag', 'salesrep'].forEach(field => {
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
        this.state.reservixID = object.reservixID;
        this.state.startDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.startDate, object.startTime).toDate();
        this.state.endDate = fieldHelpers.parseToMomentUsingDefaultTimezone(object.endDate, object.endTime).toDate();
        this.state.id = object.id || (object.kopf.titel + ' am ' + this.datumForDisplay());
        this.state.url = object.url || (this.startMoment().toISOString() + object.kopf.titel);
      }
    }

    ['agentur', 'artist', 'eintrittspreise', 'hotel', 'kasse', 'kopf', 'kosten', 'presse',
      'staff', 'technik', 'unterkunft', 'vertrag'].forEach(field => {
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
    delete this.state.reservixID;
    delete this.state.salesrep;
    delete this.state.staff.techniker;
    delete this.state.staff.technikerV;
    delete this.state.staff.kasse;
    delete this.state.staff.kasseV;
    delete this.state.staff.mod;
    delete this.state.staff.merchandise;
  }

  associateSalesreport(salesreport) {
    this.state.salesrep = salesreport.state;
    delete this.state.salesrep._id;
  }

  fullyQualifiedUrl() {
    return '/veranstaltungen/' + encodeURIComponent(this.url());
  }

  fullyQualifiedUrlForVertrag() {
    return '/vertrag/' + encodeURIComponent(this.url());
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

  salesreport() {
    if (this.state.salesrep) {
      return new Salesreport(this.state.salesrep);
    }
    return null;
  }

  staff() {
    return new Staff(this.state.staff);
  }

  technik() {
    return new Technik(this.state.technik);
  }

  unterkunft() {
    return new Unterkunft(this.state.unterkunft, this.startMoment(), this.artist().name());
  }

  vertrag() {
    return new Vertrag(this.state.vertrag);
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
    return this.kosten().totalEUR() + this.unterkunft().kostenTotalEUR() + this.kasse().ausgabenOhneGage();
  }

  einnahmenGesamtEUR() {
    return this.salesreport().nettoUmsatz() + this.kasse().einnahmeTicketsEUR();
  }

  dealAbsolutEUR() {
    return Math.max(this.bruttoUeberschussEUR() * this.kosten().dealAlsFaktor(), 0);
  }

  bruttoUeberschussEUR() {
    return this.einnahmenGesamtEUR() - this.kostenGesamtEUR();
  }

  dealUeberschussTotal() {
    return this.bruttoUeberschussEUR() - this.dealAbsolutEUR();
  }

  // Display Dates and Times

  month() {
    return this.startMoment().month();
  }

  year() {
    return this.startMoment().year();
  }

  datumForDisplayShort() {
    return this.startMoment().format('llll');
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

  getinMoment() {
    const start = moment(this.startDate());
    start.subtract(2, 'h');
    return start;
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
    return `### ${this.kopf().titel()}
#### ${this.startMoment().format('dddd, Do MMMM YYYY [um] k:mm')} ${this.kopf().presseIn()}

`;
  }

  presseTemplateInternal() {
    return `### [${this.kopf().titel()}](${config.get('publicUrlPrefix')}${this.fullyQualifiedUrl()}/presse)
#### ${this.startMoment().format('dddd, Do MMMM YYYY [um] k:mm')} ${this.kopf().presseIn()}

`;
  }

  presseTextHTML(optionalText, optionalJazzclubURL) {
    return Renderer.render(this.presseTemplate() +
      (optionalText || this.presse().text()) + '\n\n' +
      this.presse().fullyQualifiedJazzclubURL(optionalJazzclubURL)
    );
  }

  renderedPresseText() {
    return Renderer.render(this.presse().text());
  }

  presseTextForMail() {
    return this.presseTemplate() +
      this.presse().text() + '\n\n' +
      (this.presse().firstImage() ? this.presse().imageURL() : '') + '\n\n' +
      (this.presse().jazzclubURL() ? '**URL:** ' + this.presse().fullyQualifiedJazzclubURL() : '');
  }

  description() {
    return this.datumForDisplayMitKW() + ' <b>' + this.kopf().titel() + '</b>';
  }

  // GEMA
  preisAusweisGema() {
    if (this.eintrittspreise().frei() || this.kooperationGema()) {
      return '-';
    }
    return fieldHelpers.formatNumberTwoDigits(this.eintrittspreise().regulaer()) + ' €';
  }

  kooperationGema() {
    return this.kopf().rechnungAnKooperation();
  }

  einnahmenEintrittEUR() {
    return this.kasse().einnahmeTicketsEUR() + this.salesreport().bruttoUmsatz();
  }

  eintrittGema() {
    if (this.eintrittspreise().frei() || this.kooperationGema()) {
      return '-';
    }
    return fieldHelpers.formatNumberTwoDigits(this.einnahmenEintrittEUR()) + ' €';
  }

  anzahlBesucher() {
    return this.kasse().anzahlBesucherAK() + this.salesreport().anzahlRegulaer();
  }

  // iCal
  tooltipInfos() {
    return this.kopf().ort() + this.staff().tooltipInfos();
  }

  // Mailsend check
  isSendable() {
    return this.presse().checked() && this.kopf().confirmed();
  }

  kasseFehlt() {
    return this.staff().kasseFehlt() && this.kopf().confirmed();
  }
}

module.exports = Veranstaltung;
