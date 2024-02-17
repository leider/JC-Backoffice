import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";
import Staff from "../veranstaltung/staff.js";
import Technik from "../veranstaltung/technik.js";
import Kosten from "../veranstaltung/kosten.js";
import Kopf from "../veranstaltung/kopf.js";
import Presse from "../veranstaltung/presse.js";
import Artist from "../veranstaltung/artist.js";
import Angebot from "./angebot.js";
import Kontakt from "../veranstaltung/kontakt.js";
import dayjs from "dayjs";
import times from "lodash/times.js";

export default class Vermietung {
  id?: string;
  ghost? = undefined; // for displaying multidays
  startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
  endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
  url? = "";
  saalmiete? = undefined;
  brauchtTechnik = false;
  brauchtPresse = false;
  art = "Angebot";

  artist = new Artist();
  kopf = new Kopf();
  kosten = new Kosten();
  presse = new Presse();
  staff = new Staff();
  technik = new Technik();
  angebot = new Angebot();
  vertragspartner = new Kontakt();

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
      vertragspartner: this.vertragspartner.toJSON(),
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
        vertragspartner: new Kontakt(object.vertragspartner),
      });
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
      return new Vermietung(result);
    });
  }

  get isVermietung(): boolean {
    return true;
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

  get tageOhneStart(): DatumUhrzeit[] {
    const days = dayjs(this.endDate).diff(dayjs(this.startDate), "d");
    return times(days, (no) => new DatumUhrzeit(dayjs(this.startDate).add(no + 1, "d")));
  }
}
