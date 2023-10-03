import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";

export default class Vermietung {
  id?: string;
  startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
  endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
  beschreibung = "";
  titel = "";
  confirmed = false;
  url? = "";

  toJSON(): object {
    const result = {};
    Object.assign(result, this);
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
    if (object) {
      delete object._id;
      Object.assign(this, object, {
        startDate: Misc.stringOrDateToDate(object.startDate),
        endDate: Misc.stringOrDateToDate(object.endDate),
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
    return Vermietung.createUrlFrom(this.startDate, this.titel || this.id || "");
  }

  initializeIdAndUrl(): void {
    this.url = this.initializedUrl;
    this.id = this.titel + " am " + this.datumForDisplay;
  }

  reset(): void {
    this.id = undefined;
    this.url = undefined;
    this.startDate = new DatumUhrzeit().setUhrzeit(20, 0).toJSDate;
    this.endDate = DatumUhrzeit.forJSDate(this.startDate).plus({ stunden: 3 }).toJSDate;
    this.confirmed = false;
  }

  get fullyQualifiedUrl(): string {
    return "/vermietungen/" + encodeURIComponent(this.url || "");
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
}
