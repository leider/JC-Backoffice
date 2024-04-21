import DatumUhrzeit from "../commons/DatumUhrzeit.js";

import Eintrittspreise from "./eintrittspreise.js";
import Kasse from "./kasse.js";
import Kontakt from "../veranstaltung/kontakt.js";
import Unterkunft from "./unterkunft.js";
import Vertrag from "./vertrag.js";
import Veranstaltung, { MinimalVeranstaltung } from "../veranstaltung/veranstaltung.js";

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
export default class Konzert extends Veranstaltung {
  changelist?: ChangelistItem[] = undefined;
  gaesteliste: NameWithNumber[] = [];
  reservierungen: NameWithNumber[] = [];

  agentur = new Kontakt();
  eintrittspreise = new Eintrittspreise();
  hotel = new Kontakt();
  kasse = new Kasse();
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
    super(object);
    if (object) {
      Object.assign(this, {
        agentur: new Kontakt(object.agentur),
        eintrittspreise: new Eintrittspreise(object.eintrittspreise),
        hotel: new Kontakt(object.hotel),
        kasse: new Kasse(object.kasse),
        vertrag: new Vertrag(object.vertrag),
        changelist: object.changelist || [],
        gaesteliste: object.gaesteliste || [],
        reservierungen: object.reservierungen || [],
      });
      this.unterkunft = new Unterkunft(object.unterkunft, this.startDatumUhrzeit, this.artist.name);
    } else {
      this.unterkunft = new Unterkunft(undefined, this.startDatumUhrzeit, this.artist.name);
    }
  }

  asNew(object: MinimalVeranstaltung) {
    return new Konzert(object);
  }

  get isVermietung(): boolean {
    return false;
  }

  reset(): void {
    super.reset();
    this.kopf.abgesagt = false;
    this.kopf.rechnungAnKooperation = false;
    this.unterkunft = new Unterkunft(undefined, new DatumUhrzeit().setUhrzeit(20, 0), []);
    this.kasse = new Kasse();
    this.changelist = undefined;
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

  get getinDatumUhrzeit(): DatumUhrzeit {
    return this.startDatumUhrzeit.minus({ stunden: 2 });
  }

  // iCal
  get tooltipInfos(): string {
    return (this.kopf.ort !== "Jazzclub" ? this.kopf.ort : "") + this.staff.tooltipInfos;
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
