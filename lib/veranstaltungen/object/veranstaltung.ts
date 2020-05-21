/*eslint no-underscore-dangle: 0 */
import fieldHelpers from "../../commons/fieldHelpers";
import DatumUhrzeit from "../../commons/DatumUhrzeit";

import Artist, { ArtistUI } from "./artist";
import Eintrittspreise, { EintrittspreiseUI } from "./eintrittspreise";
import Kasse, { KasseUI } from "./kasse";
import Kontakt, { KontaktUI } from "./kontakt";
import Kopf, { KopfUI } from "./kopf";
import Kosten, { KostenUI } from "./kosten";
import Presse, { PresseUI } from "./presse";
import Staff, { StaffUI } from "./staff";
import Technik, { TechnikUI } from "./technik";
import Unterkunft, { UnterkunftUI } from "./unterkunft";
import Vertrag, { VertragUI } from "./vertrag";
import Salesreport from "../../reservix/salesreport";
import { Hotelpreise } from "../../optionen/optionValues";
import Misc from "../../commons/misc";
import misc from "../../commons/misc";

export interface VeranstaltungUI {
  id?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  url?: string;
  reservixID?: string;

  agentur?: KontaktUI;
  artist?: ArtistUI;
  eintrittspreise?: EintrittspreiseUI;
  hotel?: KontaktUI;
  kasse?: KasseUI;
  kopf?: KopfUI;
  kosten?: KostenUI;
  presse?: PresseUI;
  staff?: StaffUI;
  technik?: TechnikUI;
  unterkunft?: UnterkunftUI;
  vertrag?: VertragUI;
  hotelpreise?: Hotelpreise;
}

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

  toJSON(): {} {
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

  static createUrlFrom(date: Date, titel: string): string {
    return DatumUhrzeit.forJSDate(date).fuerCalendarWidget + "-" + misc.normalizeString(titel);
  }

  get initializedUrl(): string {
    return Veranstaltung.createUrlFrom(this.startDate, this.kopf.titel || this.id || "");
  }

  fillFromUI(object: VeranstaltungUI): Veranstaltung {
    if (!object.kopf && !object.id) {
      return this;
    }

    if (object.id) {
      this.id = object.id;
    }

    if (object.kopf) {
      if (object.startDate) {
        this.reservixID = object.reservixID;
        this.startDate = DatumUhrzeit.forGermanStringOrNow(object.startDate, object.startTime).toJSDate;
        this.endDate = DatumUhrzeit.forGermanStringOrNow(object.endDate, object.endTime).toJSDate;
        this.id = object.id || object.kopf.titel + " am " + this.datumForDisplay();
        this.url = object.url || Veranstaltung.createUrlFrom(this.startDate, object.kopf.titel || this.id);
      }
      this.kopf.fillFromUI(object.kopf);
    }
    if (object.agentur) {
      this.agentur.fillFromUI(object.agentur);
    }
    if (object.artist) {
      this.artist.fillFromUI(object.artist);
    }
    if (object.eintrittspreise) {
      this.eintrittspreise.fillFromUI(object.eintrittspreise);
    }
    if (object.hotel) {
      this.hotel.fillFromUI(object.hotel);
    }
    if (object.kasse) {
      this.kasse.fillFromUI(object.kasse);
    }
    if (object.kosten) {
      this.kosten.fillFromUI(object.kosten);
    }
    if (object.presse) {
      this.presse.fillFromUI(object.presse).toJSON();
    }
    if (object.staff) {
      this.staff = this.staff.fillFromUI(object.staff);
    }
    if (object.technik) {
      this.technik.fillFromUI(object.technik).toJSON();
    }
    if (object.unterkunft) {
      this.unterkunft.fillFromUI(object.unterkunft);
    }
    if (object.vertrag) {
      this.vertrag.fillFromUI(object.vertrag);
    }
    return this;
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
    return this.salesreport?.netto || this.kasse.einnahmeTicketsEUR;
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
    return `### [${this.kopf.titel}](${prefix}${this.fullyQualifiedUrl()}/presse)
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
