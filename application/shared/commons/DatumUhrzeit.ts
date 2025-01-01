import dayjs, { Dayjs } from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import "dayjs/locale/de.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import conf from "./simpleConfigure.js";

dayjs.extend(customParseFormat);

dayjs.extend(duration);

dayjs.extend(isSameOrBefore);

dayjs.extend(isoWeek);

dayjs.extend(localizedFormat);

dayjs.extend(advancedFormat);

dayjs.extend(weekOfYear);

dayjs.locale("de");

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Europe/Berlin");

export type AdditionOptions = {
  jahre?: number;
  monate?: number;
  wochen?: number;
  tage?: number;
  stunden?: number;
  minuten?: number;
};

export default class DatumUhrzeit {
  private readonly val: Dayjs;

  constructor(dateTime?: Dayjs) {
    this.val = dateTime && dateTime.isValid() ? dateTime : dayjs(conf.nowForDevelopment);
  }

  // Konstruktoren
  static forYYMM(YYMM: string): DatumUhrzeit {
    return new DatumUhrzeit(dayjs(YYMM, "YYMM"));
  }

  static forYYYYMM(YYYYMM: string): DatumUhrzeit {
    return new DatumUhrzeit(dayjs(YYYYMM, "YYYYMM"));
  }

  static forYYYYslashMM(YYYYMM: string): DatumUhrzeit {
    return new DatumUhrzeit(dayjs(YYYYMM, "YYYY/MM"));
  }

  static forMonatLangJahrKompakt(MMM_apostrophYY: string): DatumUhrzeit {
    return new DatumUhrzeit(dayjs(MMM_apostrophYY, "MMMM 'YY"));
  }

  static forISOString(ISO: string): DatumUhrzeit {
    return new DatumUhrzeit(dayjs(ISO));
  }

  static forJSDate(jsDate: Date): DatumUhrzeit {
    return new DatumUhrzeit(dayjs(jsDate));
  }

  static forGermanString(dateString?: string, timeString?: string): DatumUhrzeit | null {
    if (dateString) {
      return new DatumUhrzeit(dayjs(dateString + " " + (timeString || "00:00"), ["DD.MM.YYYY[ ]HH:mm", "DD.MM.YY[ ]HH:mm"]));
    }
    return null;
  }

  static forGermanStringOrNow(dateString?: string, timeString?: string): DatumUhrzeit {
    if (dateString) {
      return new DatumUhrzeit(dayjs(dateString + " " + (timeString || "00:00"), ["DD.MM.YYYY[ ]HH:mm", "DD.MM.YY[ ]HH:mm"]));
    }
    return new DatumUhrzeit();
  }

  // Rechnen
  plus(options: AdditionOptions): DatumUhrzeit {
    const d = this.value
      .add(options.jahre || 0, "y")
      .add(options.monate || 0, "M")
      .add(options.wochen || 0, "w")
      .add(options.tage || 0, "d")
      .add(options.stunden || 0, "h")
      .add(options.minuten || 0, "m");
    return new DatumUhrzeit(d);
  }

  minus(options: AdditionOptions): DatumUhrzeit {
    const d = this.value
      .subtract(options.jahre || 0, "y")
      .subtract(options.monate || 0, "M")
      .subtract(options.wochen || 0, "w")
      .subtract(options.tage || 0, "d")
      .subtract(options.stunden || 0, "h")
      .subtract(options.minuten || 0, "m");
    return new DatumUhrzeit(d);
  }

  differenzInTagen(other: DatumUhrzeit): number {
    return Math.trunc(this.value.diff(other.value, "day"));
  }

  differenzInMonaten(other: DatumUhrzeit): number {
    return Math.trunc(this.value.diff(other.value, "month"));
  }

  moveByDifferenceDays(newDate: Dayjs) {
    const diff = new DatumUhrzeit(newDate).setUhrzeit(8, 0).differenzInTagen(this.setUhrzeit(8, 0));
    return this.plus({ tage: diff }).value;
  }

  // Vergleiche
  istVor(other: DatumUhrzeit): boolean {
    return this.value < other.value;
  }

  istVorOderAn(other: DatumUhrzeit): boolean {
    return this.value.isSameOrBefore(other.value);
  }

  istNach(other: DatumUhrzeit): boolean {
    return this.value.isAfter(other.value);
  }

  // getter
  get monat(): number {
    return this.value.month() + 1;
  }

  get jahr(): number {
    return this.value.year();
  }

  get tag(): number {
    return this.value.date();
  }

  get kw(): number {
    return this.value.isoWeek();
  }

  get wochentag(): number {
    return this.value.day();
  }

  // pseudosetter

  setTag(tag: number): DatumUhrzeit {
    return new DatumUhrzeit(this.value.date(tag));
  }

  setUhrzeit(stunde: number, minuten: number): DatumUhrzeit {
    return new DatumUhrzeit(this.value.hour(stunde).minute(minuten));
  }

  // Formatierungen
  get yyyyMM(): string {
    return this.format("YYYYMM");
  }

  get monatLang(): string {
    return this.format("MMMM");
  }

  get monatKompakt(): string {
    return this.format("MMM");
  }

  get wochentagTagMonat(): string {
    return this.format("ddd DD. MMMM");
  }

  get wochentagTagMonatShort(): string {
    return this.format("ddd DD. MMM");
  }

  get tagMonatJahrKompakt(): string {
    return this.format("DD.MM.YYYY");
  }

  get uhrzeitKompakt(): string {
    return this.format("LT");
  }

  get wochentagUhrzeitKompakt(): string {
    return this.format("dd. LT");
  }

  get tagMonatJahrLang(): string {
    return this.format("LL");
  }

  get tagMonatJahrLangMitKW(): string {
    return this.format("LL [(KW ]ww[)]");
  }

  get lesbareLangform(): string {
    return this.format("LLLL");
  }

  get lesbareKurzform(): string {
    return this.format("llll");
  }

  get monatJahrKompakt(): string {
    return this.format("MMM[ ']YY");
  }

  get monatLangJahrKompakt(): string {
    return this.format("MMMM") + " '" + this.format("YY");
  }

  get fuerKalenderViews(): string {
    return this.format("YYYY/MM");
  }

  get fuerCalendarWidget(): string {
    return this.format("YYYY-MM-DD");
  }

  get fuerCsvExport(): string {
    return `${this.format("YYYY-MM-DD")}T${this.format("HH:mm")}`;
  }

  get tagNumerisch(): string {
    return this.format("Do");
  }

  get mitUhrzeitNumerisch(): string {
    return this.format("DD.MM.YY HH:mm");
  }

  get fuerUnterseiten(): string {
    return this.format("YYMM");
  }

  get fuerPresse(): string {
    return this.format("dddd, LL [um] HH:mm");
  }

  get fuerIcal(): string {
    return this.value.utc().format("YYYYMMDD[T]HHmmss[Z]");
  }

  format(options: string): string {
    return this.value.format(options);
  }

  get toLocalDateTimeString(): string {
    return this.format("DD.MM.YYYY[,] HH:mm:ss");
  }

  get toISOString(): string {
    return this.value.toISOString();
  }

  get monatTag(): string {
    return this.value.format("MM-DD");
  }

  get toJSDate(): Date {
    return this.value.toDate();
  }

  // special
  get vorigerOderAktuellerUngeraderMonat(): DatumUhrzeit {
    return this.minus({ monate: this.istGeraderMonat ? 1 : 0 });
  }

  get naechsterUngeraderMonat(): DatumUhrzeit {
    return this.plus({ monate: this.istGeraderMonat ? 1 : 2 });
  }

  get istGeraderMonat(): boolean {
    return this.monat % 2 === 0;
  }

  get value(): Dayjs {
    return this.val;
  }
}
