const moment = require('moment-timezone');

class DatumUhrzeit {
  constructor(jsDate, optionalLocale) {
    this.locale = optionalLocale || DatumUhrzeit.defaultLocale;
    this.jsDate = moment(jsDate || new Date()).toDate();
  }

  // Konstruktoren
  static forYYMM(stringYYMM) {
    return new DatumUhrzeit(moment(stringYYMM + '01', 'YYMMDD').toDate());
  }

  static forYYYYMM(stringYYYYMM) {
    return new DatumUhrzeit(moment(stringYYYYMM, 'YYYYMM').toDate());
  }

  static forISOString(stringISO) {
    return new DatumUhrzeit(moment(stringISO).toDate());
  }

  // Rechnen
  plus(options) {
    const m = moment(this.jsDate);
    if (options.jahre) {
      m.add(options.jahre, 'years');
    }
    if (options.monate) {
      m.add(options.monate, 'months');
    }
    if (options.wochen) {
      m.add(options.wochen, 'weeks');
    }
    if (options.tage) {
      m.add(options.tage, 'days');
    }
    if (options.stunden) {
      m.add(options.stunden, 'hours');
    }
    if (options.minuten) {
      m.add(options.minuten, 'minutes');
    }
    return new DatumUhrzeit(m.toDate());
  }

  minus(options) {
    const m = moment(this.jsDate);
    if (options.jahre) {
      m.subtract(options.jahre, 'years');
    }
    if (options.monate) {
      m.subtract(options.monate, 'months');
    }
    if (options.wochen) {
      m.subtract(options.wochen, 'weeks');
    }
    if (options.tage) {
      m.subtract(options.tage, 'days');
    }
    if (options.stunden) {
      m.subtract(options.stunden, 'hours');
    }
    if (options.minuten) {
      m.subtract(options.minuten, 'minutes');
    }
    return new DatumUhrzeit(m.toDate());
  }

  differenzInTagen(other) {
    return moment(this.jsDate).diff(other.jsDate, 'days');
  }

  // Vergleiche
  istVor(other) {
    return this.jsDate < other.jsDate;
  }

  istNach(other) {
    return this.jsDate > other.jsDate;
  }

  // getter
  monat() {
    return moment(this.jsDate).month(); // 0 based
  }

  tag() {
    return moment(this.jsDate).date();
  }

  kw() {
    return moment(this.jsDate).week();
  }

  wochentag() {
    return moment(this.jsDate).isoWeekday(); // 0 based
  }

  // pseudosetter

  setTag(tag) {
    return new DatumUhrzeit(
      moment(this.jsDate)
        .date(tag)
        .toDate()
    );
  }

  // Formatierungen
  monatLang() {
    return this.format('MMMM');
  }

  monatKompakt() {
    return this.format('MMM');
  }

  tagMonatJahrKompakt() {
    return this.format('L');
  }

  tagMonatJahrLang() {
    return this.format('LL');
  }

  monatJahrKompakt() {
    return this.format("MMM 'YY");
  }

  fuerKalenderViews() {
    return this.format('YYYY/MM');
  }

  fuerCalendarWidget() {
    return this.format('YYYY-MM-DD');
  }

  format(string) {
    return moment(this.jsDate).format(string);
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
    return new Intl.DateTimeFormat(this.locale, options).format(this.jsDate);
  }

  toJSDate() {
    return this.jsDate;
  }

  // special
  vorigerOderAktuellerUngeraderMonat() {
    return this.minus({ monate: 1 + (this.monat() % 2 ? 0 : -1) });
  }

  naechsterUngeraderMonat() {
    return this.plus({ monate: 1 + (this.monat() % 2 ? 0 : 1) });
  }
}
DatumUhrzeit.defaultLocale = 'de-DE';

module.exports = DatumUhrzeit;
