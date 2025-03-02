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
import { colorVermietung } from "../optionen/optionValues.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import map from "lodash/map.js";
import tinycolor from "tinycolor2";

export type MinimalVeranstaltung = Partial<Veranstaltung> & { id: string; startDate: Date; kopf: Kopf; url: string; ghost: boolean };
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
  brauchtPresse = true;

  constructor(
    object?: RecursivePartial<Omit<Veranstaltung, "startDate" | "endDate"> & { startDate: string | Date; endDate: string | Date }>,
  ) {
    if (object) {
      Object.assign(this, {
        id: object.id,
        ghost: object.ghost,
        brauchtPresse: object.brauchtPresse ?? true,
        startDate: Misc.stringOrDateToDate(object.startDate),
        endDate: Misc.stringOrDateToDate(object.endDate),
        url: object.url,
        artist: new Artist(object.artist as Omit<Artist, "getInForMasterDate"> & { getInForMasterDate: string | Date }),
        kopf: new Kopf(object.kopf),
        kosten: new Kosten(object.kosten),
        presse: new Presse(object.presse),
        staff: new Staff(object.staff),
        technik: new Technik(object.technik),
      });
    } else {
      this.startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
      this.endDate = new DatumUhrzeit().setUhrzeit(23, 0).toJSDate;
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

  abstract asNew(object: MinimalVeranstaltung): Veranstaltung;

  createGhostsForOverview() {
    const ghostResults = map(this.tageOhneStart, (ghostStart) => {
      return {
        id: `${this.id}ghost${ghostStart.toISOString}`,
        startDate: ghostStart.setUhrzeit(0, 0).toJSDate,
        kopf: this.kopf,
        url: this.url,
        ghost: true,
      };
    });
    return map(ghostResults, (each) => this.asNew(each as MinimalVeranstaltung));
  }

  get color(): string {
    const color = this.isVermietung ? colorVermietung : this.kopf.color;
    return this.ghost ? tinycolor(color).brighten(5).toHexString() : color;
  }

  colorText(darkMode: boolean): string {
    const lightText = darkMode ? "#dcdcdc" : "#ffffff";
    const darkText = darkMode ? "#666666" : "#111111";
    const lightGhost = tinycolor(lightText).darken().toHexString();
    const darkGhost = tinycolor(darkText).lighten(40).toHexString();

    const color = this.color;

    if (this.ghost) {
      return tinycolor.readability(color, lightGhost) > 2 ? lightGhost : darkGhost;
    } else {
      return tinycolor.readability(color, lightText) > 2 ? lightText : darkText;
    }
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

  // eslint-disable-next-line lodash/prefer-constant
  get tooltipInfos(): string {
    return "";
  }
  asCalendarEvent(isOrgaTeam: boolean, darkMode: boolean): TerminEvent {
    return {
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      title: this.kopf.titelMitPrefix,
      tooltip: this.tooltipInfos,
      linkTo: isOrgaTeam ? this.fullyQualifiedUrl : this.fullyQualifiedPreviewUrl,
      backgroundColor: this.color,
      textColor: this.colorText(darkMode),
      borderColor: !this.kopf.confirmed ? "#f8500d" : this.color,
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
