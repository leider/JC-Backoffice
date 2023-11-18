import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";
import Staff from "../veranstaltung/staff.js";
import Technik from "../veranstaltung/technik.js";
import Kosten from "../veranstaltung/kosten.js";
import Kopf from "../veranstaltung/kopf.js";
import Presse from "../veranstaltung/presse.js";
import Artist from "../veranstaltung/artist.js";
import Angebot from "./angebot.js";

export default class Vermietung {
  id?: string;
  startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
  endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
  url? = "";
  saalmiete? = undefined;
  brauchtTechnik = false;
  brauchtPresse = false;

  artist = new Artist();
  kopf = new Kopf();
  kosten = new Kosten();
  presse = new Presse();
  staff = new Staff();
  technik = new Technik();
  angebot = new Angebot();

  toJSON(): object {
    const result = {};
    Object.assign(result, this, {
      artist: this.artist.toJSON(),
      kopf: this.kopf.toJSON(),
      kosten: this.kosten.toJSON(),
      presse: this.presse.toJSON(),
      staff: this.staff.toJSON(),
      technik: this.technik.toJSON(),
      angebot: this.angebot.toJSON(),
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
        artist: new Artist(object.artist),
        kopf: new Kopf(object.kopf),
        kosten: new Kosten(object.kosten),
        presse: new Presse(object.presse),
        staff: new Staff(object.staff),
        technik: new Technik(object.technik),
        angebot: new Angebot(object.angebot),
      });
    }
  }

  get isVermietung(): boolean {
    return true;
  }
  get isValid(): boolean {
    return this.startDatumUhrzeit.istVorOderAn(this.endDatumUhrzeit);
  }

  static createUrlFrom(date: Date, titel: string): string {
    return DatumUhrzeit.forJSDate(date).fuerCalendarWidget + "-" + Misc.normalizeString(titel);
  }

  private get initializedUrl(): string {
    return Vermietung.createUrlFrom(this.startDate, this.kopf.titel || this.id || "");
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
    this.kopf.confirmed = false;
    this.kopf.fotografBestellen = false;
    this.kopf.kannAufHomePage = false;
    this.kopf.kannInSocialMedia = false;
  }

  get fullyQualifiedUrl(): string {
    return "/vermietung/" + encodeURIComponent(this.url || "");
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
}
