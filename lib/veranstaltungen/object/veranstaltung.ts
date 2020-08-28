/*eslint no-underscore-dangle: 0 */
import fieldHelpers from "../../commons/fieldHelpers";
import DatumUhrzeit from "../../commons/DatumUhrzeit";

import Artist from "./artist";
import Eintrittspreise from "./eintrittspreise";
import Kasse from "./kasse";
import Kontakt from "./kontakt";
import Kopf from "./kopf";
import Kosten from "./kosten";
import Presse from "./presse";
import Staff from "./staff";
import Technik from "./technik";
import Unterkunft from "./unterkunft";
import Vertrag from "./vertrag";
import Salesreport from "../../reservix/salesreport";
import Misc from "../../commons/misc";

export interface ImageOverviewVeranstaltung {
  id: string;
  startDate: DatumUhrzeit;
  titel: string;
  fullyQualifiedUrl: string;
  images: string[];
}

export interface ImageOverviewRow {
  image: string;
  newname: string;
  veranstaltungen: ImageOverviewVeranstaltung[];
}

export default class Veranstaltung {
  id?: string;
  startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
  endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
  url? = "";
  reservixID?: string;

  agentur = new Kontakt();
  artist = new Artist();
  eintrittspreise = new Eintrittspreise();
  hotel = new Kontakt();
  kasse = new Kasse();
  kopf = new Kopf();
  kosten = new Kosten();
  presse = new Presse();
  salesreport = new Salesreport();
  staff = new Staff();
  technik = new Technik();
  vertrag = new Vertrag();

  unterkunft: Unterkunft;

  toJSON(): object {
    const result = {};
    Object.assign(result, this, {
      agentur: this.agentur.toJSON(),
      artist: this.artist.toJSON(),
      eintrittspreise: this.eintrittspreise.toJSON(),
      hotel: this.hotel.toJSON(),
      kasse: this.kasse.toJSON(),
      kopf: this.kopf.toJSON(),
      kosten: this.kosten.toJSON(),
      presse: this.presse.toJSON(),
      salesrep: this.salesreport.toJSON(),
      staff: this.staff.toJSON(),
      technik: this.technik.toJSON(),
      unterkunft: this.unterkunft.toJSON(),
      vertrag: this.vertrag.toJSON(),
    });
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
    if (object) {
      delete object._id;
      Object.assign(this, object, {
        startDate: Misc.stringOrDateToDate(object.startDate),
        endDate: Misc.stringOrDateToDate(object.endDate),
        kopf: new Kopf(object.kopf),
        agentur: new Kontakt(object.agentur),
        artist: new Artist(object.artist),
        eintrittspreise: new Eintrittspreise(object.eintrittspreise),
        hotel: new Kontakt(object.hotel),
        kasse: new Kasse(object.kasse),
        kosten: new Kosten(object.kosten),
        presse: new Presse(object.presse),
        salesreport: new Salesreport(object.salesrep),
        staff: new Staff(object.staff),
        technik: new Technik(object.technik),
        vertrag: new Vertrag(object.vertrag),
      });
      this.unterkunft = new Unterkunft(object.unterkunft, this.startDatumUhrzeit(), this.artist.name);
    } else {
      this.unterkunft = new Unterkunft(undefined, this.startDatumUhrzeit(), this.artist.name);
    }
  }

  get isValid(): boolean {
    return this.kopf.isValid && this.startDatumUhrzeit().istVorOderAn(this.endDatumUhrzeit());
  }

  static createUrlFrom(date: Date, titel: string): string {
    return DatumUhrzeit.forJSDate(date).fuerCalendarWidget + "-" + Misc.normalizeString(titel);
  }

  get initializedUrl(): string {
    return Veranstaltung.createUrlFrom(this.startDate, this.kopf.titel || this.id || "");
  }

  initializeIdAndUrl(): void {
    this.url = this.initializedUrl;
    this.id = this.kopf.titel + " am " + this.datumForDisplay();
  }

  reset(): void {
    this.id = undefined;
    this.url = undefined;
    this.startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
    this.endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
    this.reservixID = undefined;
    this.staff = new Staff();
    this.kopf.confirmed = false;
  }

  associateSalesreport(salesreport?: Salesreport): void {
    if (salesreport) {
      this.salesreport = salesreport;
    }
  }

  fullyQualifiedUrl(): string {
    return "/veranstaltungen/" + encodeURIComponent(this.url || "");
  }

  fullyQualifiedUrlForVertrag(): string {
    return "/vertrag/" + encodeURIComponent(this.url || "");
  }

  // Image Overview
  get suitableForImageOverview(): ImageOverviewVeranstaltung {
    return {
      id: this.id || "",
      startDate: this.startDatumUhrzeit(),
      titel: this.kopf.titel,
      fullyQualifiedUrl: this.fullyQualifiedUrl(),
      images: this.presse.image,
    };
  }

  // Money - GEMA - Reservix

  kostenGesamtEUR(): number {
    return this.kosten.totalEUR() + this.unterkunft.kostenTotalEUR() + this.kasse.ausgabenOhneGage();
  }

  einnahmenGesamtEUR(): number {
    return this.salesreport?.netto + this.eintrittspreise.erwarteterOderEchterEintritt(this.kasse);
  }

  dealAbsolutEUR(): number {
    return Math.max(this.bruttoUeberschussEUR() * this.kosten.dealAlsFaktor(), 0);
  }

  bruttoUeberschussEUR(): number {
    return this.einnahmenGesamtEUR() - this.kostenGesamtEUR();
  }

  dealUeberschussTotal(): number {
    return this.bruttoUeberschussEUR() - this.dealAbsolutEUR();
  }

  // Display Dates and Times

  month(): number {
    return this.startDatumUhrzeit().monat;
  }

  year(): number {
    return this.startDatumUhrzeit().jahr;
  }

  tagNumerisch(): string {
    return this.startDatumUhrzeit().tagNumerisch;
  }

  datumForDisplayShort(): string {
    return this.startDatumUhrzeit().lesbareKurzform;
  }

  datumForDisplay(): string {
    return this.startDatumUhrzeit().tagMonatJahrLang;
  }

  datumForDisplayMitKW(): string {
    return this.startDatumUhrzeit().tagMonatJahrLangMitKW;
  }

  startDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.startDate);
  }

  getinDatumUhrzeit(): DatumUhrzeit {
    return this.startDatumUhrzeit().minus({ stunden: 2 });
  }

  minimalStartForEdit(): DatumUhrzeit {
    return this.startDatumUhrzeit().istVor(new DatumUhrzeit()) ? this.startDatumUhrzeit() : new DatumUhrzeit();
  }

  endDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.endDate);
  }

  istVergangen(): boolean {
    return this.startDatumUhrzeit().istVor(new DatumUhrzeit());
  }

  // utility
  presseTemplate(): string {
    return `### ${this.kopf.titel}
#### ${this.startDatumUhrzeit().fuerPresse} ${this.kopf.presseInEcht()}
**Eintritt:** ${this.eintrittspreise.alsPressetext(this.kopf.isKooperation() ? this.kopf.kooperation : "")}

`;
  }

  presseTemplateInternal(prefix: string): string {
    // für interne Mails
    return `### [${this.kopf.titel}](${prefix}/vue${this.fullyQualifiedUrl()}/presse)
#### ${this.startDatumUhrzeit().fuerPresse} ${this.kopf.presseInEcht()}

`;
  }

  presseTextForMail(prefix: string): string {
    return (
      this.presseTemplate() +
      this.presse.text +
      "\n\n" +
      (this.presse.firstImage() ? this.presse.imageURL(prefix) : "") +
      "\n\n" +
      (this.presse.jazzclubURL ? `**URL:** ${this.presse.fullyQualifiedJazzclubURL()}` : "")
    );
  }

  description(): string {
    return `${this.datumForDisplayMitKW()} ${this.kopf.titel}`;
  }

  // GEMA
  preisAusweisGema(): string {
    if (this.eintrittspreise.frei() || this.kooperationGema()) {
      return "-";
    }
    return `${fieldHelpers.formatNumberTwoDigits(this.eintrittspreise.regulaer())} €`;
  }

  kooperationGema(): boolean {
    return this.kopf.rechnungAnKooperationspartner();
  }

  einnahmenEintrittEUR(): number {
    return this.kasse.einnahmeTicketsEUR + (this.salesreport?.brutto || 0);
  }

  eintrittGema(): string {
    if (this.eintrittspreise.frei() || this.kooperationGema()) {
      return "-";
    }
    return `${fieldHelpers.formatNumberTwoDigits(this.einnahmenEintrittEUR())} €`;
  }

  anzahlBesucher(): number {
    return this.kasse.anzahlBesucherAK + (this.salesreport?.anzahl || 0);
  }

  // iCal
  tooltipInfos(): string {
    return this.kopf.ort + this.staff.tooltipInfos();
  }

  // Mailsend check
  isSendable(): boolean {
    return this.presse.checked && this.kopf.confirmed;
  }

  kasseFehlt(): boolean {
    return this.staff.kasseFehlt() && this.kopf.confirmed;
  }

  // CSV Export
  toCSV(): string {
    return `${this.kopf.titel};${this.kopf.eventTyp};${this.startDatumUhrzeit().fuerCsvExport}`;
  }

  updateImageName(oldname: string, newname: string): void {
    this.presse.image = this.presse.image.filter((each) => each !== oldname);
    this.presse.image.push(newname);
  }
}
