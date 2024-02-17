import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";

import Artist from "./artist.js";
import Eintrittspreise from "./eintrittspreise.js";
import Kasse from "./kasse.js";
import Kontakt from "./kontakt.js";
import Kopf from "./kopf.js";
import Kosten from "./kosten.js";
import Presse from "./presse.js";
import Staff from "./staff.js";
import Technik from "./technik.js";
import Unterkunft from "./unterkunft.js";
import Vertrag from "./vertrag.js";
import dayjs from "dayjs";
import times from "lodash/times.js";

export interface ImageOverviewVeranstaltung {
  id: string;
  startDate: string;
  titel: string;
  url: string;
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

export interface NameWithNumber {
  name: string;
  comment: string;
  number: number;
  alreadyIn: number;
}

export type GastArt = "res" | "gast";
export default class Veranstaltung {
  id?: string;
  ghost? = undefined; // for displaying multidays
  startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
  endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
  url? = "";
  changelist: ChangelistItem[] = [];
  gaesteliste: NameWithNumber[] = [];
  reservierungen: NameWithNumber[] = [];

  agentur = new Kontakt();
  artist = new Artist();
  eintrittspreise = new Eintrittspreise();
  hotel = new Kontakt();
  kasse = new Kasse();
  kopf = new Kopf();
  kosten = new Kosten();
  presse = new Presse();
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
        staff: new Staff(object.staff),
        technik: new Technik(object.technik),
        vertrag: new Vertrag(object.vertrag),
      });
      this.unterkunft = new Unterkunft(object.unterkunft, this.startDatumUhrzeit, this.artist.name);
    } else {
      this.unterkunft = new Unterkunft(undefined, this.startDatumUhrzeit, this.artist.name);
    }
  }

  createGhostsForOverview() {
    return this.tageOhneStart.map((ghostStart) => {
      const result = {};
      Object.assign(result, {
        id: `${this.id}ghost${ghostStart.toISOString}`,
        startDate: ghostStart.toJSDate,
        kopf: this.kopf,
        url: this.url,
        ghost: true,
      });
      return new Veranstaltung(result);
    });
  }

  get isVermietung(): boolean {
    return false;
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
    this.staff = new Staff();
    this.unterkunft = new Unterkunft(undefined, new DatumUhrzeit().setUhrzeit(20, 0), []);
    this.kasse = new Kasse();
    this.kopf.confirmed = false;
    this.kopf.abgesagt = false;
    this.kopf.rechnungAnKooperation = false;
    this.kopf.fotografBestellen = false;
    this.kopf.kannAufHomePage = false;
    this.kopf.kannInSocialMedia = false;
  }

  get fullyQualifiedUrl(): string {
    return "/veranstaltungen/" + encodeURIComponent(this.url || "");
  }

  // Image Overview
  get suitableForImageOverview(): ImageOverviewVeranstaltung {
    return {
      id: this.id || "",
      startDate: this.startDatumUhrzeit.tagMonatJahrKompakt,
      titel: this.kopf.titel,
      url: this.url || "",
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

  get datumForDisplay(): string {
    return this.startDatumUhrzeit.tagMonatJahrLang;
  }

  get datumForDisplayShort(): string {
    return this.startDatumUhrzeit.lesbareKurzform;
  }

  get istVergangen(): boolean {
    return this.startDatumUhrzeit.istVor(new DatumUhrzeit());
  }

  get tageOhneStart(): DatumUhrzeit[] {
    const days = dayjs(this.endDate).diff(dayjs(this.startDate), "d");
    return times(days, (no) => new DatumUhrzeit(dayjs(this.startDate).add(no + 1, "d")));
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
