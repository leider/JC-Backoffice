'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const DatumUhrzeit = beans.get('DatumUhrzeit');

describe('DatumUhrzeit', () => {
  describe('creation', () => {
    const festesDatum = new Date(2019, 3, 30, 13, 43, 30); // month is zero based like java

    it('kann ohne Parameter erzeugt werden', () => {
      const aktMonat = new Intl.DateTimeFormat('de-DE', {
        month: 'long'
      }).format(new Date());

      expect(new DatumUhrzeit().monatLang()).to.eql(aktMonat);
    });

    it('kann mit Parameter erzeugt werden', () => {
      expect(new DatumUhrzeit(festesDatum).toLocalDateTimeString()).to.eql(
        '30.04.2019, 13:43:30'
      );
      expect(new DatumUhrzeit(festesDatum).toJSDate()).to.eql(festesDatum);
    });

    it('kann mit String "YYMM" erzeugt werden', () => {
      expect(DatumUhrzeit.forYYMM('1903').toLocalDateTimeString()).to.eql(
        '01.03.2019, 00:00:00'
      );
    });

    it('kann mit String "YYYYMM" erzeugt werden', () => {
      expect(DatumUhrzeit.forYYYYMM('201903').toLocalDateTimeString()).to.eql(
        '01.03.2019, 00:00:00'
      );
    });

    it('kann mit ISO String erzeugt werden', () => {
      expect(
        DatumUhrzeit.forISOString(
          '2019-03-01T00:00:00+01:00'
        ).toLocalDateTimeString()
      ).to.eql('01.03.2019, 00:00:00');
    });
  });

  describe('plus und minus (Datum) mit immutability', () => {
    const januar01 = DatumUhrzeit.forISOString('2019-01-01');
    const januar0129 = DatumUhrzeit.forISOString('2029-01-01');
    const februar01 = DatumUhrzeit.forISOString('2019-02-01');
    const januar31 = DatumUhrzeit.forISOString('2019-01-31');
    const februar28 = DatumUhrzeit.forISOString('2019-02-28');
    const maerz31 = DatumUhrzeit.forISOString('2019-03-31');
    const maerz04 = DatumUhrzeit.forISOString('2019-03-04');

    it('rechnet mit Monaten', () => {
      expect(januar01.plus({ monate: 1 })).to.eql(februar01);
      expect(februar01.minus({ monate: 1 })).to.eql(januar01);
      expect(januar01.toLocalDateTimeString()).to.eql('01.01.2019, 00:00:00');
    });

    it('rechnet mit Monaten am Monatsletzten', () => {
      expect(januar31.plus({ monate: 1 })).to.eql(februar28);
      expect(maerz31.minus({ monate: 1 })).to.eql(februar28);
    });

    it('rechnet mit Tagen', () => {
      expect(januar01.plus({ tage: 31 })).to.eql(februar01);
      expect(februar01.plus({ tage: 31 })).to.eql(maerz04);
      expect(januar01.toLocalDateTimeString()).to.eql('01.01.2019, 00:00:00');
    });

    it('rechnet mit Monaten und Tagen', () => {
      expect(januar31.plus({ monate: 1, tage: 4 })).to.eql(maerz04);
      expect(maerz04.minus({ monate: 1, tage: 4 })).to.eql(januar31);
      expect(januar31.toLocalDateTimeString()).to.eql('31.01.2019, 00:00:00');
    });

    it('rechnet mit Jahren', () => {
      expect(januar01.plus({ jahre: 10 })).to.eql(januar0129);
      expect(januar0129.minus({ jahre: 10 })).to.eql(januar01);
      expect(januar01.toLocalDateTimeString()).to.eql('01.01.2019, 00:00:00');
    });
  });

  describe('plus und minus (Uhrzeit)', () => {
    const vorSommerzeit = DatumUhrzeit.forISOString('2019-03-30 23:00:00');
    const plus10Minuten = DatumUhrzeit.forISOString('2019-03-30 23:10:00');
    const plus1Stunde = DatumUhrzeit.forISOString('2019-03-31 00:00:00');
    const plus4Stunden = DatumUhrzeit.forISOString('2019-03-31 04:00:00');

    it('rechnet mit Minuten', () => {
      expect(vorSommerzeit.plus({ minuten: 10 })).to.eql(plus10Minuten);
      expect(plus10Minuten.minus({ minuten: 10 })).to.eql(vorSommerzeit);
    });

    it('rechnet mit Stunden', () => {
      expect(vorSommerzeit.plus({ stunden: 1 })).to.eql(plus1Stunde);
      expect(vorSommerzeit.plus({ stunden: 4 })).to.eql(plus4Stunden);
      expect(plus1Stunde.minus({ stunden: 1 })).to.eql(vorSommerzeit);
    });
  });

  describe('Differenz', () => {
    const januar01 = DatumUhrzeit.forISOString('2019-01-01');
    const januar31 = DatumUhrzeit.forISOString('2019-01-31');

    it('in Tagen', () => {
      expect(januar31.differenzInTagen(januar01)).to.eql(30);
      expect(januar01.differenzInTagen(januar31)).to.eql(-30);
    });
  });

  describe('formatting', () => {
    const januar01 = DatumUhrzeit.forISOString('2019-01-01');

    it('formatiert nur den Monat', () => {
      expect(januar01.monatLang()).to.eql('Januar');
    });

    it('formatiert nur den Monat kompakt', () => {
      expect(januar01.monatKompakt()).to.eql('Jan.');
    });

    it('formatiert Tag Monat Jahr', () => {
      expect(januar01.tagMonatJahrLang()).to.eql('1. Januar 2019');
    });

    it('formatiert Tag Monat Jahr kopakt', () => {
      expect(januar01.tagMonatJahrKompakt()).to.eql('01.01.2019');
    });

    it('formatiert Monat Jahr kompakt', () => {
      expect(januar01.monatJahrKompakt()).to.eql("Jan. '19");
    });

    it('formatiert für Kalender Anzeige', () => {
      expect(januar01.fuerKalenderViews()).to.eql('2019/01');
    });

    it('formatiert für Calendar Widget', () => {
      expect(januar01.fuerCalendarWidget()).to.eql('2019-01-01');
    });
  });

  describe('Vergleiche', () => {
    const januar01 = DatumUhrzeit.forISOString('2019-01-01');
    const februar01 = DatumUhrzeit.forISOString('2019-02-01');

    it('kleiner', () => {
      expect(januar01.istVor(februar01)).to.be(true);
    });

    it('grösser', () => {
      expect(februar01.istNach(januar01)).to.be(true);
    });

    it('formatiert Monat Jahr kompakt', () => {
      expect(januar01.monatJahrKompakt()).to.eql("Jan. '19");
    });
  });

  describe('Spezialmethoden', () => {
    it('findet vorhergehenden oder aktuellen ungeraden Monat', () => {
      expect(
        DatumUhrzeit.forISOString(
          '2020-04-30'
        ).vorigerOderAktuellerUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-03-30'));
      expect(
        DatumUhrzeit.forISOString(
          '2020-03-20'
        ).vorigerOderAktuellerUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-03-20'));
      expect(
        DatumUhrzeit.forISOString(
          '2020-02-29'
        ).vorigerOderAktuellerUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-01-29'));
      expect(
        DatumUhrzeit.forISOString(
          '2020-01-20'
        ).vorigerOderAktuellerUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-01-20'));
      expect(
        DatumUhrzeit.forISOString(
          '2020-12-31'
        ).vorigerOderAktuellerUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-11-30'));
      expect(
        DatumUhrzeit.forISOString(
          '2020-11-20'
        ).vorigerOderAktuellerUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-11-20'));
    });

    it('findet mächsten ungeraden Monat', () => {
      expect(
        DatumUhrzeit.forISOString('2020-04-30').naechsterUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-05-30'));
      expect(
        DatumUhrzeit.forISOString('2020-03-31').naechsterUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-05-31'));
      expect(
        DatumUhrzeit.forISOString('2020-02-29').naechsterUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-03-29'));
      expect(
        DatumUhrzeit.forISOString('2020-01-31').naechsterUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2020-03-31'));
      expect(
        DatumUhrzeit.forISOString('2020-12-31').naechsterUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2021-01-31'));
      expect(
        DatumUhrzeit.forISOString('2020-11-30').naechsterUngeraderMonat()
      ).to.eql(DatumUhrzeit.forISOString('2021-01-30'));
    });
  });
});
