import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";
import Artist from "./artist.js";
import Kopf from "./kopf.js";
import Kosten from "./kosten.js";
import Presse from "./presse.js";
import Staff from "./staff.js";
import Technik from "./technik.js";
import dayjs from "dayjs";
import times from "lodash/times.js";
import { TerminEvent } from "../optionen/termin.js";

export type MinimalVeranstaltung = { id: string; startDate: Date; kopf: Kopf; url: string; ghost: boolean };
export default abstract class Veranstaltung {
  id?: string;
  ghost? = undefined; // for displaying multidays
  startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
  endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
  url? = "";
  artist = new Artist(undefined);
  kopf = new Kopf();
  kosten = new Kosten();
  presse = new Presse();
  staff = new Staff();
  technik = new Technik();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
    if (object) {
      Object.assign(this, {
        id: object.id,
        ghost: object.ghost,
        startDate: Misc.stringOrDateToDate(object.startDate),
        endDate: Misc.stringOrDateToDate(object.endDate),
        url: object.url,
        artist: new Artist(object.artist),
        kopf: new Kopf(object.kopf),
        kosten: new Kosten(object.kosten),
        presse: new Presse(object.presse),
        staff: new Staff(object.staff),
        technik: new Technik(object.technik),
      });
    }
  }

  abstract toJSON(): object;

  abstract get isVermietung(): boolean;

  get fullyQualifiedUrl(): string {
    return `${this.isVermietung ? "/vermietung/" : "/konzert/"}${encodeURIComponent(this.url || "")}`;
  }

  get fullyQualifiedPreviewUrl(): string {
    return `${this.isVermietung ? "/vermietung/" : "/konzert/"}preview/${encodeURIComponent(this.url || "")}`;
  }

  // eslint-disable-next-line no-unused-vars
  abstract asNew(object: MinimalVeranstaltung): Veranstaltung;

  protected ghostResults() {
    return this.tageOhneStart.map((ghostStart) => {
      const result: MinimalVeranstaltung = {} as MinimalVeranstaltung;
      Object.assign(result, {
        id: `${this.id}ghost${ghostStart.toISOString}`,
        startDate: ghostStart.setUhrzeit(0, 0).toJSDate,
        kopf: this.kopf,
        url: this.url,
        ghost: true,
      });
      return result;
    });
  }
  createGhostsForOverview() {
    return this.ghostResults().map((each) => this.asNew(each));
  }

  get initializedUrl(): string {
    return DatumUhrzeit.forJSDate(this.startDate).fuerCalendarWidget + "-" + Misc.normalizeString(this.kopf.titel || this.id || "");
  }

  initializeIdAndUrl(): void {
    this.url = this.initializedUrl;
    this.id = this.kopf.titel + " am " + this.datumForDisplay;
  }

  get tageOhneStart(): DatumUhrzeit[] {
    const days = dayjs(this.endDate).diff(dayjs(this.startDate), "d");
    return times(days, (no) => new DatumUhrzeit(dayjs(this.startDate).add(no + 1, "d")));
  }

  // Dates and Times
  get startDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.startDate);
  }

  get endDatumUhrzeit(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(this.endDate);
  }

  get datumForDisplayShort(): string {
    return this.startDatumUhrzeit.lesbareKurzform;
  }

  get datumForDisplay(): string {
    return this.startDatumUhrzeit.tagMonatJahrLang;
  }

  get istVergangen(): boolean {
    return this.startDatumUhrzeit.istVor(new DatumUhrzeit());
  }

  get tooltipInfos(): string {
    return "";
  }
  asCalendarEvent(isOrgaTeam: boolean, color: string): TerminEvent {
    return {
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      title: this.kopf.titelMitPrefix,
      tooltip: this.tooltipInfos,
      linkTo: isOrgaTeam ? this.fullyQualifiedUrl : this.fullyQualifiedPreviewUrl,
      backgroundColor: color,
      textColor: this.isVermietung ? "#111" : "#fff",
      borderColor: !this.kopf.confirmed ? "#f8500d" : color,
    };
  }

  reset(): void {
    this.id = undefined;
    this.url = undefined;
    this.startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
    this.endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
    this.artist.getInForMasterDate = undefined;
    this.artist.bandTransport = undefined;
    this.staff = new Staff();
    this.kopf.confirmed = false;
    this.kopf.fotografBestellen = false;
    this.kopf.kannAufHomePage = false;
    this.kopf.kannInSocialMedia = false;
  }
}
