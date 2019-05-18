const { Settings, DateTime } = require('luxon');
Settings.defaultLocale = 'de';

class DatumUhrzeit {
  constructor(dateTime, optionalLocale) {
    this.locale = optionalLocale || DatumUhrzeit.defaultLocale;
    this.dateTime = dateTime || DateTime.local();
  }

  // Konstruktoren
  static forYYMM(stringYYMM) {
    return new DatumUhrzeit(DateTime.fromFormat(stringYYMM, 'yyMM'));
  }

  static forYYYYMM(stringYYYYMM) {
    return new DatumUhrzeit(DateTime.fromFormat(stringYYYYMM, 'yyyyMM'));
  }

  static forISOString(stringISO) {
    return new DatumUhrzeit(DateTime.fromISO(stringISO));
  }

  static forJSDate(jsDate) {
    return new DatumUhrzeit(DateTime.fromJSDate(jsDate));
  }

  static forGermanString(dateString, timeString) {
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

  // Rechnen
  plus(options) {
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

  minus(options) {
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

  differenzInTagen(other) {
    return this.dateTime.diff(other.dateTime, 'days').days;
  }

  // Vergleiche
  istVor(other) {
    return this.dateTime < other.dateTime;
  }

  istNach(other) {
    return this.dateTime > other.dateTime;
  }

  // getter
  monat() {
    return this.dateTime.month;
  }

  jahr() {
    return this.dateTime.year;
  }

  tag() {
    return this.dateTime.day;
  }

  kw() {
    return this.dateTime.weekNumber;
  }

  wochentag() {
    return this.dateTime.weekday;
  }

  // pseudosetter

  setTag(tag) {
    return new DatumUhrzeit(this.dateTime.set({ day: tag }));
  }

  setUhrzeit(stunde, minuten) {
    return new DatumUhrzeit(
      this.dateTime.set({ hours: stunde, minutes: minuten })
    );
  }

  // Formatierungen
  monatLang() {
    return this.format('MMMM');
  }

  monatKompakt() {
    return this.format('MMM');
  }

  wochentagTagMonat() {
    return this.format('ccc. dd. MMMM');
  }

  tagMonatJahrKompakt() {
    return this.format('dd.LL.yyyy');
  }

  uhrzeitKompakt() {
    return this.format('T');
  }

  tagMonatJahrLang() {
    return this.format('DDD');
  }

  tagMonatJahrLangMitKW() {
    return this.format("DDD (K'W' WW)");
  }

  lesbareLangform() {
    return this.format('DDDD t');
  }

  lesbareKurzform() {
    return this.format('ccc., ff');
  }

  monatJahrKompakt() {
    return this.format('MMM') + " '" + this.format('yy');
  }

  monatLangJahrKompakt() {
    return this.format('MMMM') + " '" + this.format('yy');
  }

  fuerKalenderViews() {
    return this.format('yyyy/MM');
  }

  fuerCalendarWidget() {
    return this.format('yyyy-MM-dd');
  }

  mitUhrzeitNumerisch() {
    return this.format('dd.MM.yy HH:mm');
  }

  fuerUnterseiten() {
    return this.format('yyMM');
  }

  fuerPresse() {
    return this.format("cccc, DDD 'um' HH:mm");
  }

  format(options) {
    return this.dateTime.toFormat(options);
  }

  toLocalDateTimeString() {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return new Intl.DateTimeFormat(this.locale, options).format(
      this.toJSDate()
    );
  }

  toJSDate() {
    return this.dateTime.toJSDate();
  }

  // special
  vorigerOderAktuellerUngeraderMonat() {
    return this.minus({ monate: this.istGeraderMonat() ? 1 : 0 });
  }

  naechsterUngeraderMonat() {
    return this.plus({ monate: this.istGeraderMonat() ? 1 : 2 });
  }

  istGeraderMonat() {
    return this.monat() % 2 === 0;
  }
}
DatumUhrzeit.defaultLocale = 'de-DE';

module.exports = DatumUhrzeit;
