import config from '../../commons/simpleConfigure';
import fieldHelpers from '../../commons/fieldHelpers';
import Renderer from '../../commons/renderer';
import DatumUhrzeit from '../../commons/DatumUhrzeit';

import Artist from './artist';
import Eintrittspreise from './eintrittspreise';
import Kasse from './kasse';
import Kontakt from './kontakt';
import Kopf from './kopf';
import Kosten from './kosten';
import Presse from './presse';
import Staff from './staff';
import Technik from './technik';
import Unterkunft from './unterkunft';
import Vertrag from './vertrag';
import Salesreport from '../../reservix/salesreport';

export default class Veranstaltung {
  state: { [index: string]: any };

  constructor(object: any) {
    this.state = object ? object : {};
    [
      'agentur',
      'artist',
      'eintrittspreise',
      'hotel',
      'kasse',
      'kopf',
      'kosten',
      'presse',
      'staff',
      'technik',
      'unterkunft',
      'vertrag',
      'salesrep'
    ].forEach(field => {
      this.state[field] = this.state[field] || {};
    });
  }

  fillFromUI(object: any) {
    if (!object.kopf && !object.id) {
      return;
    }

    if (object.id) {
      this.state.id = object.id;
    }

    if (object.kopf) {
      if (object.startDate) {
        this.state.reservixID = object.reservixID;
        this.state.startDate = DatumUhrzeit.forGermanStringOrNow(
          object.startDate,
          object.startTime
        ).toJSDate;
        this.state.endDate = DatumUhrzeit.forGermanStringOrNow(
          object.endDate,
          object.endTime
        ).toJSDate;
        this.state.id =
          object.id || object.kopf.titel + ' am ' + this.datumForDisplay();
        this.state.url =
          object.url || this.state.startDate.toISOString() + object.kopf.titel;
      }
    }

    [
      'agentur',
      'artist',
      'eintrittspreise',
      'hotel',
      'kasse',
      'kopf',
      'kosten',
      'presse',
      'staff',
      'technik',
      'unterkunft',
      'vertrag'
    ].forEach(field => {
      if (object[field]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
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

  associateSalesreport(salesreport?: Salesreport) {
    if (salesreport) {
      this.state.salesrep = salesreport.state;
      delete this.state.salesrep._id;
    }
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
    return new Unterkunft(
      this.state.unterkunft,
      this.startDatumUhrzeit(),
      this.artist().name()
    );
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
    return (
      this.state.startDate || new DatumUhrzeit().setUhrzeit(20, 0).toJSDate
    );
  }

  endDate() {
    return (
      this.state.endDate ||
      this.startDatumUhrzeit().plus({ stunden: 3 }).toJSDate
    );
  }

  // Money - GEMA - Reservix

  kostenGesamtEUR() {
    return (
      this.kosten().totalEUR() +
      this.unterkunft().kostenTotalEUR() +
      this.kasse().ausgabenOhneGage()
    );
  }

  einnahmenGesamtEUR() {
    return (
      this.salesreport()?.nettoUmsatz() + this.kasse().einnahmeTicketsEUR()
    );
  }

  dealAbsolutEUR() {
    return Math.max(
      this.bruttoUeberschussEUR() * this.kosten().dealAlsFaktor(),
      0
    );
  }

  bruttoUeberschussEUR() {
    return this.einnahmenGesamtEUR() - this.kostenGesamtEUR();
  }

  dealUeberschussTotal() {
    return this.bruttoUeberschussEUR() - this.dealAbsolutEUR();
  }

  // Display Dates and Times

  month() {
    return this.startDatumUhrzeit().monat;
  }

  year() {
    return this.startDatumUhrzeit().jahr;
  }

  datumForDisplayShort() {
    return this.startDatumUhrzeit().lesbareKurzform;
  }

  datumForDisplay() {
    return this.startDatumUhrzeit().tagMonatJahrLang;
  }

  datumForDisplayMitKW() {
    return this.startDatumUhrzeit().tagMonatJahrLangMitKW;
  }

  startDatumUhrzeit() {
    return DatumUhrzeit.forJSDate(this.startDate());
  }

  getinDatumUhrzeit() {
    return this.startDatumUhrzeit().minus({ stunden: 2 });
  }

  minimalStartForEdit() {
    return this.startDatumUhrzeit().istVor(new DatumUhrzeit())
      ? this.startDatumUhrzeit()
      : new DatumUhrzeit();
  }

  endDatumUhrzeit() {
    return DatumUhrzeit.forJSDate(this.endDate());
  }

  istVergangen() {
    return this.startDatumUhrzeit().istVor(new DatumUhrzeit());
  }

  // utility
  presseTemplate() {
    return `### ${this.kopf().titel()}
#### ${this.startDatumUhrzeit().fuerPresse} ${this.kopf().presseIn()}
**Eintritt:** ${this.eintrittspreise().alsPressetext(
      this.kopf().isKooperation() ? this.kopf().kooperation() : null
    )}

`;
  }

  presseTemplateInternal() {
    // für interne Mails
    return `### [${this.kopf().titel()}](${config.get(
      'publicUrlPrefix'
    )}${this.fullyQualifiedUrl()}/presse)
#### ${this.startDatumUhrzeit().fuerPresse} ${this.kopf().presseIn()}

`;
  }

  presseTextHTML(optionalText: string, optionalJazzclubURL: string) {
    return Renderer.render(
      this.presseTemplate() +
        (optionalText || this.presse().text()) +
        '\n\n' +
        this.presse().fullyQualifiedJazzclubURL(optionalJazzclubURL)
    );
  }

  renderedPresseText() {
    return Renderer.render(this.presse().text());
  }

  presseTextForMail() {
    return (
      this.presseTemplate() +
      this.presse().text() +
      '\n\n' +
      (this.presse().firstImage() ? this.presse().imageURL() : '') +
      '\n\n' +
      (this.presse().jazzclubURL()
        ? '**URL:** ' + this.presse().fullyQualifiedJazzclubURL()
        : '')
    );
  }

  description() {
    return this.datumForDisplayMitKW() + ' <b>' + this.kopf().titel() + '</b>';
  }

  // GEMA
  preisAusweisGema() {
    if (this.eintrittspreise().frei() || this.kooperationGema()) {
      return '-';
    }
    return (
      fieldHelpers.formatNumberTwoDigits(this.eintrittspreise().regulaer()) +
      ' €'
    );
  }

  kooperationGema() {
    return this.kopf().rechnungAnKooperation();
  }

  einnahmenEintrittEUR() {
    return (
      this.kasse().einnahmeTicketsEUR() + this.salesreport()?.bruttoUmsatz()
    );
  }

  eintrittGema() {
    if (this.eintrittspreise().frei() || this.kooperationGema()) {
      return '-';
    }
    return (
      fieldHelpers.formatNumberTwoDigits(this.einnahmenEintrittEUR()) + ' €'
    );
  }

  anzahlBesucher() {
    return (
      this.kasse().anzahlBesucherAK() + this.salesreport()?.anzahlRegulaer()
    );
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

  // CSV Export
  toCSV() {
    return `${this.kopf().titel()};${this.kopf().eventTyp()};${
      this.startDatumUhrzeit().fuerCsvExport
    }`;
  }
}
