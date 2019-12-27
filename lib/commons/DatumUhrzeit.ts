import { Settings, DateTime } from 'luxon';
Settings.defaultLocale = 'de';

export default class DatumUhrzeit {
  private locale: string;
  private dateTime: DateTime;

  constructor(dateTime?: DateTime) {
    this.locale = 'de-DE';
    this.dateTime = dateTime || DateTime.local();
  }

  // Konstruktoren
  static forYYMM(YYMM: string) {
    return new DatumUhrzeit(DateTime.fromFormat(YYMM, 'yyMM'));
  }

  static forYYYYMM(YYYYMM: string) {
    return new DatumUhrzeit(DateTime.fromFormat(YYYYMM, 'yyyyMM'));
  }

  static forISOString(ISO: string) {
    return new DatumUhrzeit(DateTime.fromISO(ISO));
  }

  static forJSDate(jsDate: Date) {
    return new DatumUhrzeit(DateTime.fromJSDate(jsDate));
  }

  static forGermanString(dateString?: string, timeString?: string) {
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

  static forReservixString(dateString: string, timeString: string) {
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
  plus(options: any) {
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

  minus(options: any) {
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

  differenzInTagen(other: DatumUhrzeit) {
    return this.dateTime.diff(other.dateTime, 'days').days;
  }

  // Vergleiche
  istVor(other: DatumUhrzeit) {
    return this.dateTime < other.dateTime;
  }

  istNach(other: DatumUhrzeit) {
    return this.dateTime > other.dateTime;
  }

  // getter
  get monat() {
    return this.dateTime.month;
  }

  get jahr() {
    return this.dateTime.year;
  }

  get tag() {
    return this.dateTime.day;
  }

  get kw() {
    return this.dateTime.weekNumber;
  }

  get wochentag() {
    return this.dateTime.weekday;
  }

  // pseudosetter

  setTag(tag: number) {
    return new DatumUhrzeit(this.dateTime.set({ day: tag }));
  }

  setUhrzeit(stunde: number, minuten: number) {
    return new DatumUhrzeit(
      this.dateTime.set({ hour: stunde, minute: minuten })
    );
  }

  // Formatierungen
  get monatLang() {
    return this.format('MMMM');
  }

  get monatKompakt() {
    return this.format('MMM');
  }

  get wochentagTagMonat() {
    return this.format('ccc. dd. MMMM');
  }

  get tagMonatJahrKompakt() {
    return this.format('dd.LL.yyyy');
  }

  get uhrzeitKompakt() {
    return this.format('T');
  }

  get tagMonatJahrLang() {
    return this.format('DDD');
  }

  get tagMonatJahrLangMitKW() {
    return this.format("DDD (K'W' WW)");
  }

  get lesbareLangform() {
    return this.format('DDDD t');
  }

  get lesbareKurzform() {
    return this.format('ccc., ff');
  }

  get monatJahrKompakt() {
    return this.format('MMM') + " '" + this.format('yy');
  }

  get monatLangJahrKompakt() {
    return this.format('MMMM') + " '" + this.format('yy');
  }

  get fuerKalenderViews() {
    return this.format('yyyy/MM');
  }

  get fuerCalendarWidget() {
    return this.format('yyyy-MM-dd');
  }

  get fuerCsvExport() {
    return this.format("yyyy-MM-dd'T'HH:mm");
  }

  get mitUhrzeitNumerisch() {
    return this.format('dd.MM.yy HH:mm');
  }

  get fuerUnterseiten() {
    return this.format('yyMM');
  }

  get fuerPresse() {
    return this.format("cccc, DDD 'um' HH:mm");
  }

  format(options: string) {
    return this.dateTime.toFormat(options);
  }

  get toLocalDateTimeString() {
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

  get toJSDate() {
    return this.dateTime.toJSDate();
  }

  // special
  get vorigerOderAktuellerUngeraderMonat() {
    return this.minus({ monate: this.istGeraderMonat ? 1 : 0 });
  }

  get naechsterUngeraderMonat() {
    return this.plus({ monate: this.istGeraderMonat ? 1 : 2 });
  }

  get istGeraderMonat() {
    return this.monat % 2 === 0;
  }
}
