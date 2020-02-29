/*eslint no-underscore-dangle: 0 */
import config from "../../commons/simpleConfigure";
import fieldHelpers from "../../commons/fieldHelpers";
import Renderer from "../../commons/renderer";
import DatumUhrzeit from "../../commons/DatumUhrzeit";

import Artist, { ArtistRaw, ArtistUI } from "./artist";
import Eintrittspreise, { EintrittspreiseRaw, EintrittspreiseUI } from "./eintrittspreise";
import Kasse, { KasseRaw, KasseUI } from "./kasse";
import Kontakt, { KontaktRaw, KontaktUI } from "./kontakt";
import Kopf, { KopfRaw, KopfUI } from "./kopf";
import Kosten, { KostenRaw, KostenUI } from "./kosten";
import Presse, { PresseRaw, PresseUI } from "./presse";
import Staff, { StaffRaw, StaffUI } from "./staff";
import Technik, { TechnikRaw, TechnikUI } from "./technik";
import Unterkunft, { UnterkunftRaw, UnterkunftUI } from "./unterkunft";
import Vertrag, { VertragRaw } from "./vertrag";
import Salesreport, { ReservixState } from "../../reservix/salesreport";
import { Hotelpreise } from "../../optionen/optionValues";

interface VeranstaltungRaw {
  id?: string;
  startDate: Date;
  endDate: Date;
  url?: string;
  reservixID?: string;

  agentur?: KontaktRaw;
  artist?: ArtistRaw;
  eintrittspreise?: EintrittspreiseRaw | Eintrittspreise;
  hotel?: KontaktRaw;
  kasse?: KasseRaw;
  kopf?: KopfRaw;
  kosten?: KostenRaw;
  presse?: PresseRaw;
  staff?: StaffRaw;
  technik?: TechnikRaw;
  unterkunft?: UnterkunftRaw;
  vertrag?: VertragRaw;
  salesrep?: ReservixState;
}

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
  vertrag?: VertragRaw;
  hotelpreise?: Hotelpreise;
}

export default class Veranstaltung implements VeranstaltungRaw {
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

  static fromJSON(object: VeranstaltungRaw): Veranstaltung {
    return new Veranstaltung(object);
  }

  toJSON(): VeranstaltungRaw {
    const result = {} as VeranstaltungRaw;
    result.id = this.id;
    result.startDate = this.startDate;
    result.endDate = this.endDate;
    result.url = this.url;
    result.reservixID = this.reservixID;

    result.agentur = this.agentur.toJSON();
    result.artist = this.artist.toJSON();
    result.eintrittspreise = this.eintrittspreise.toJSON();
    result.hotel = this.hotel.toJSON();
    result.kasse = this.kasse.toJSON();
    result.kopf = this.kopf.toJSON();
    result.kosten = this.kosten.toJSON();
    result.presse = this.presse.toJSON();
    result.salesrep = this.salesreport.toJSON();
    result.staff = this.staff.toJSON();
    result.technik = this.technik.toJSON();
    result.unterkunft = this.unterkunft.toJSON();
    result.vertrag = this.vertrag.toJSON();
    return result;
  }

  constructor(object?: VeranstaltungRaw) {
    if (object) {
      this.id = object.id;
      this.startDate = object.startDate;
      this.endDate = object.endDate;
      this.url = object.url;
      this.reservixID = object.reservixID;

      this.kopf = new Kopf(object.kopf);

      this.agentur = new Kontakt(object.agentur);
      this.artist = new Artist(object.artist);
      this.eintrittspreise = new Eintrittspreise(object.eintrittspreise as EintrittspreiseRaw);
      this.hotel = new Kontakt(object.hotel);
      this.kasse = new Kasse(object.kasse);
      this.kosten = new Kosten(object.kosten);
      this.presse = new Presse(object.presse);
      this.salesreport = new Salesreport(object.salesrep);
      this.staff = new Staff(object.staff);
      this.technik = new Technik(object.technik);
      this.unterkunft = new Unterkunft(object.unterkunft, this.startDatumUhrzeit(), this.artist.name);
      this.vertrag = new Vertrag(object.vertrag);
    } else {
      this.unterkunft = new Unterkunft(undefined, this.startDatumUhrzeit(), this.artist.name);
    }
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
        this.url = object.url || this.startDate.toISOString() + object.kopf.titel;
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

  presseTemplateInternal(): string {
    // für interne Mails
    return `### [${this.kopf.titel}](${config.get("publicUrlPrefix")}${this.fullyQualifiedUrl()}/presse)
#### ${this.startDatumUhrzeit().fuerPresse} ${this.kopf.presseInEcht()}

`;
  }

  presseTextHTML(optionalText: string, optionalJazzclubURL: string): string {
    return Renderer.render(
      this.presseTemplate() + (optionalText || this.presse.text) + "\n\n" + this.presse.fullyQualifiedJazzclubURL(optionalJazzclubURL)
    );
  }

  renderedPresseText(): string {
    return Renderer.render(this.presse.text);
  }

  presseTextForMail(): string {
    return (
      this.presseTemplate() +
      this.presse.text +
      "\n\n" +
      (this.presse.firstImage() ? this.presse.imageURL() : "") +
      "\n\n" +
      (this.presse.jazzclubURL ? `**URL:** ${this.presse.fullyQualifiedJazzclubURL()}` : "")
    );
  }

  description(): string {
    return `${this.datumForDisplayMitKW()} <b>${this.kopf.titel}</b>`;
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
}
