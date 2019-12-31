import { Settings, DateTime } from 'luxon';
Settings.defaultLocale = 'de';

type AdditionOptions = {
  jahre?: number;
  monate?: number;
  wochen?: number;
  tage?: number;
  stunden?: number;
  minuten?: number;
};

export default class DatumUhrzeit {
  private locale: string;
  private dateTime: DateTime;

  constructor(dateTime?: DateTime) {
    this.locale = 'de-DE';
    this.dateTime = dateTime || DateTime.local();
  }

  // Konstruktoren
  static forYYMM(YYMM: string): DatumUhrzeit {
    return new DatumUhrzeit(DateTime.fromFormat(YYMM, 'yyMM'));
  }

  static forYYYYMM(YYYYMM: string): DatumUhrzeit {
    return new DatumUhrzeit(DateTime.fromFormat(YYYYMM, 'yyyyMM'));
  }

  static forISOString(ISO: string): DatumUhrzeit {
    return new DatumUhrzeit(DateTime.fromISO(ISO));
  }

  static forJSDate(jsDate: Date): DatumUhrzeit {
    return new DatumUhrzeit(DateTime.fromJSDate(jsDate));
  }

  static forGermanString(
    dateString?: string,
    timeString?: string
  ): DatumUhrzeit | undefined {
    if (dateString) {
      return new DatumUhrzeit(
        DateTime.fromFormat(
          dateString + ' ' + (timeString || '00:00'),
          'dd.MM.yy HH:mm'
        )
      );
    }
    return undefined;
  }

  static forGermanStringOrNow(
    dateString?: string,
    timeString?: string
  ): DatumUhrzeit {
    if (dateString) {
      return new DatumUhrzeit(
        DateTime.fromFormat(
          dateString + ' ' + (timeString || '00:00'),
          'dd.MM.yy HH:mm'
        )
      );
    }
    return new DatumUhrzeit();
  }

  static forReservixString(
    dateString: string,
    timeString: string
  ): DatumUhrzeit | undefined {
    // z.B. So, 12.05.2019, 20:00 Uhr
    if (dateString) {
      return new DatumUhrzeit(
        DateTime.fromFormat(
          dateString.replace(/^[a-zA-Z]*, /, '') +
            ' ' +
            (timeString || '00:00 Uhr'),
          "dd.MM.yy HH:mm 'Uhr'"
        )
      );
    }
    return undefined;
  }

  // Rechnen
  plus(options: AdditionOptions): DatumUhrzeit {
    const d = this.dateTime.plus({
      years: options.jahre,
      months: options.monate,
      weeks: options.wochen,
      days: options.tage,
      hours: options.stunden,
      minutes: options.minuten
    });
    return new DatumUhrzeit(d);
  }

  minus(options: AdditionOptions): DatumUhrzeit {
    const d = this.dateTime.minus({
      years: options.jahre,
      months: options.monate,
      weeks: options.wochen,
      days: options.tage,
      hours: options.stunden,
      minutes: options.minuten
    });
    return new DatumUhrzeit(d);
  }

  differenzInTagen(other: DatumUhrzeit): number {
    return this.dateTime.diff(other.dateTime, 'days').days;
  }

  // Vergleiche
  istVor(other: DatumUhrzeit): boolean {
    return this.dateTime < other.dateTime;
  }

  istNach(other: DatumUhrzeit): boolean {
    return this.dateTime > other.dateTime;
  }

  // getter
  get monat(): number {
    return this.dateTime.month;
  }

  get jahr(): number {
    return this.dateTime.year;
  }

  get tag(): number {
    return this.dateTime.day;
  }

  get kw(): number {
    return this.dateTime.weekNumber;
  }

  get wochentag(): number {
    return this.dateTime.weekday;
  }

  // pseudosetter

  setTag(tag: number): DatumUhrzeit {
    return new DatumUhrzeit(this.dateTime.set({ day: tag }));
  }

  setUhrzeit(stunde: number, minuten: number): DatumUhrzeit {
    return new DatumUhrzeit(
      this.dateTime.set({ hour: stunde, minute: minuten })
    );
  }

  // Formatierungen
  get monatLang(): string {
    return this.format('MMMM');
  }

  get monatKompakt(): string {
    return this.format('MMM');
  }

  get wochentagTagMonat(): string {
    return this.format('ccc. dd. MMMM');
  }

  get tagMonatJahrKompakt(): string {
    return this.format('dd.LL.yyyy');
  }

  get uhrzeitKompakt(): string {
    return this.format('T');
  }

  get tagMonatJahrLang(): string {
    return this.format('DDD');
  }

  get tagMonatJahrLangMitKW(): string {
    return this.format("DDD (K'W' WW)");
  }

  get lesbareLangform(): string {
    return this.format('DDDD t');
  }

  get lesbareKurzform(): string {
    return this.format('ccc., ff');
  }

  get monatJahrKompakt(): string {
    return this.format('MMM') + " '" + this.format('yy');
  }

  get monatLangJahrKompakt(): string {
    return this.format('MMMM') + " '" + this.format('yy');
  }

  get fuerKalenderViews(): string {
    return this.format('yyyy/MM');
  }

  get fuerCalendarWidget(): string {
    return this.format('yyyy-MM-dd');
  }

  get fuerCsvExport(): string {
    return this.format("yyyy-MM-dd'T'HH:mm");
  }

  get mitUhrzeitNumerisch(): string {
    return this.format('dd.MM.yy HH:mm');
  }

  get fuerUnterseiten(): string {
    return this.format('yyMM');
  }

  get fuerPresse(): string {
    return this.format("cccc, DDD 'um' HH:mm");
  }

  format(options: string): string {
    return this.dateTime.toFormat(options);
  }

  get toLocalDateTimeString(): string {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return new Intl.DateTimeFormat(this.locale, options).format(this.toJSDate);
  }

  get toJSDate(): Date {
    return this.dateTime.toJSDate();
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

  get value(): DateTime {
    return this.dateTime;
  }
}
