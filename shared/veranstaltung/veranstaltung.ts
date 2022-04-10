import DatumUhrzeit from "../commons/DatumUhrzeit";
import Misc from "../commons/misc";

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
import Salesreport from "./salesreport";
import VeranstaltungGema from "./veranstaltungGema";

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

export interface ChangelistItem {
  bearbeiter: string;
  zeitpunkt: string;
  diff: string;
}

export default class Veranstaltung {
  id?: string;
  startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
  endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
  url? = "";
  reservixID?: string;
  changelist: ChangelistItem[] = [];

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
      salesreport: this.salesreport.toJSON(),
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
        salesreport: new Salesreport(object.salesreport),
        staff: new Staff(object.staff),
        technik: new Technik(object.technik),
        vertrag: new Vertrag(object.vertrag),
      });
      this.unterkunft = new Unterkunft(object.unterkunft, this.startDatumUhrzeit, this.artist.name);
    } else {
      this.unterkunft = new Unterkunft(undefined, this.startDatumUhrzeit, this.artist.name);
    }
  }

  get isValid(): boolean {
    return this.kopf.isValid && this.startDatumUhrzeit.istVorOderAn(this.endDatumUhrzeit);
  }

  static createUrlFrom(date: Date, titel: string): string {
    return DatumUhrzeit.forJSDate(date).fuerCalendarWidget + "-" + Misc.normalizeString(titel);
  }

  private get initializedUrl(): string {
    return Veranstaltung.createUrlFrom(this.startDate, this.kopf.titel || this.id || "");
  }

  initializeIdAndUrl(): void {
    this.url = this.initializedUrl;
    this.id = this.kopf.titel + " am " + this.datumForDisplay;
  }

  reset(): void {
    this.id = undefined;
    this.url = undefined;
    this.startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
    this.endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
    this.reservixID = undefined;
    this.staff = new Staff();
    this.unterkunft = new Unterkunft(undefined, new DatumUhrzeit().setUhrzeit(20, 0), []);
    this.kasse = new Kasse();
    this.kopf.confirmed = false;
    this.kopf.abgesagt = false;
  }

  associateSalesreport(salesreport?: Salesreport): void {
    if (salesreport) {
      this.salesreport = salesreport;
    }
  }

  get fullyQualifiedUrl(): string {
    return "/veranstaltungen/" + encodeURIComponent(this.url || "");
  }

  // Image Overview
  get suitableForImageOverview(): ImageOverviewVeranstaltung {
    return {
      id: this.id || "",
      startDate: this.startDatumUhrzeit,
      titel: this.kopf.titel,
      fullyQualifiedUrl: this.fullyQualifiedUrl,
      images: this.presse.image,
    };
  }

  // Dates and Times

  get startDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.startDate);
  }

  get endDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.endDate);
  }

  get getinDatumUhrzeit(): DatumUhrzeit {
    return this.startDatumUhrzeit.minus({ stunden: 2 });
  }

  get minimalStartForEdit(): DatumUhrzeit {
    return this.startDatumUhrzeit.istVor(new DatumUhrzeit()) ? this.startDatumUhrzeit : new DatumUhrzeit();
  }

  get datumForDisplay(): string {
    return this.startDatumUhrzeit.tagMonatJahrLang;
  }

  get datumForDisplayShort(): string {
    return this.startDatumUhrzeit.lesbareKurzform;
  }

  get istVergangen(): boolean {
    return this.startDatumUhrzeit.istVor(new DatumUhrzeit());
  }

  // GEMA
  get gema(): VeranstaltungGema {
    return new VeranstaltungGema(this);
  }

  // iCal
  get tooltipInfos(): string {
    return this.kopf.ort + this.staff.tooltipInfos;
  }

  // CSV Export
  toCSV(): string {
    return `${this.kopf.titelMitPrefix};${this.kopf.eventTyp};${this.startDatumUhrzeit.fuerCsvExport}`;
  }

  updateImageName(oldname: string, newname: string): void {
    this.presse.image = this.presse.image.filter((each) => each !== oldname);
    this.presse.image.push(newname);
  }
}
