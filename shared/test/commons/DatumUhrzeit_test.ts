/* eslint-disable no-unused-expressions*/
import { expect } from "chai";
import DatumUhrzeit from "../../commons/DatumUhrzeit.js";

describe("DatumUhrzeit", () => {
  describe("creation", () => {
    const festesDatum = new Date(2019, 3, 30, 13, 43, 30); // month is zero based like java

    it("kann ohne Parameter erzeugt werden", () => {
      const aktMonat = new Intl.DateTimeFormat("de-DE", {
        month: "long",
      }).format(new Date());

      expect(new DatumUhrzeit().monatLang).to.eql(aktMonat);
    });

    it("kann mit jsDate erzeugt werden", () => {
      expect(DatumUhrzeit.forJSDate(festesDatum).toLocalDateTimeString).to.eql("30.04.2019, 13:43:30");
      expect(DatumUhrzeit.forJSDate(festesDatum).toJSDate).to.eql(festesDatum);
    });

    it('kann mit String "YYMM" erzeugt werden', () => {
      expect(DatumUhrzeit.forYYMM("1903").toLocalDateTimeString).to.eql("01.03.2019, 00:00:00");
    });

    it('kann mit String "YYYYMM" erzeugt werden', () => {
      expect(DatumUhrzeit.forYYYYMM("201903").toLocalDateTimeString).to.eql("01.03.2019, 00:00:00");
    });

    it("kann mit ISO String erzeugt werden", () => {
      expect(DatumUhrzeit.forISOString("2019-03-01T00:00:00+01:00").toLocalDateTimeString).to.eql("01.03.2019, 00:00:00");
    });

    it("kann mit deutschem String erzeugt werden", () => {
      expect(DatumUhrzeit.forGermanString("01.03.2019", "03:04")?.toLocalDateTimeString).to.eql("01.03.2019, 03:04:00");

      expect(DatumUhrzeit.forGermanString("01.03.2019")?.toLocalDateTimeString).to.eql("01.03.2019, 00:00:00");

      expect(DatumUhrzeit.forGermanString()).to.be.null;
    });

    it("handles bullshit strings gracefully", () => {
      expect(DatumUhrzeit.forGermanStringOrNow("00.05.2019", "20:00 Uhr").value.isValid()).to.eq(true);
    });
  });

  describe("plus und minus (Datum) mit immutability", () => {
    const januar01 = DatumUhrzeit.forISOString("2019-01-01");
    const januar15 = DatumUhrzeit.forISOString("2019-01-15");
    const januar0129 = DatumUhrzeit.forISOString("2029-01-01");
    const februar01 = DatumUhrzeit.forISOString("2019-02-01");
    const februar14 = DatumUhrzeit.forISOString("2019-02-14");
    const januar31 = DatumUhrzeit.forISOString("2019-01-31");
    const februar28 = DatumUhrzeit.forISOString("2019-02-28");
    const maerz31 = DatumUhrzeit.forISOString("2019-03-31");
    const maerz04 = DatumUhrzeit.forISOString("2019-03-04");

    it("rechnet mit Monaten", () => {
      expect(januar01.plus({ monate: 1 }).value).to.eql(februar01.value);
      expect(februar01.minus({ monate: 1 }).value).to.eql(januar01.value);
      expect(januar01.toLocalDateTimeString).to.eql("01.01.2019, 00:00:00");
    });

    it("rechnet mit Monaten am Monatsletzten", () => {
      expect(januar31.plus({ monate: 1 }).value).to.eql(februar28.value);
      expect(maerz31.minus({ monate: 1 }).value).to.eql(februar28.value);
    });

    it("rechnet mit Wochen", () => {
      expect(januar01.plus({ wochen: 2 }).value).to.eql(januar15.value);
      expect(januar31.plus({ wochen: 2 }).value).to.eql(februar14.value);
    });

    it("rechnet mit Tagen", () => {
      expect(januar01.plus({ tage: 31 }).value).to.eql(februar01.value);
      expect(februar01.plus({ tage: 31 }).value).to.eql(maerz04.value);
      expect(januar01.toLocalDateTimeString).to.eql("01.01.2019, 00:00:00");
    });

    it("rechnet mit Monaten und Tagen", () => {
      expect(januar31.plus({ monate: 1, tage: 4 }).value).to.eql(maerz04.value);
      expect(maerz04.minus({ monate: 1, tage: 4 }).value).to.eql(januar31.value);
      expect(januar31.toLocalDateTimeString).to.eql("31.01.2019, 00:00:00");
    });

    it("rechnet mit Jahren", () => {
      expect(januar01.plus({ jahre: 10 }).value).to.eql(januar0129.value);
      expect(januar0129.minus({ jahre: 10 }).value).to.eql(januar01.value);
      expect(januar01.toLocalDateTimeString).to.eql("01.01.2019, 00:00:00");
    });
  });

  describe("plus und minus (Uhrzeit)", () => {
    const vorSommerzeit = DatumUhrzeit.forISOString("2019-03-30T23:00:00");
    const plus10Minuten = DatumUhrzeit.forISOString("2019-03-30T23:10:00");
    const plus1Stunde = DatumUhrzeit.forISOString("2019-03-31T00:00:00");
    const plus4Stunden = DatumUhrzeit.forISOString("2019-03-31T04:00:00");

    it("rechnet mit Minuten", () => {
      expect(vorSommerzeit.plus({ minuten: 10 }).value).to.eql(plus10Minuten.value);
      expect(plus10Minuten.minus({ minuten: 10 }).value).to.eql(vorSommerzeit.value);
    });

    it("rechnet mit Stunden", () => {
      expect(vorSommerzeit.plus({ stunden: 1 }).value).to.eql(plus1Stunde.value);
      expect(vorSommerzeit.plus({ stunden: 4 }).value).to.eql(plus4Stunden.value);
      expect(plus1Stunde.minus({ stunden: 1 }).value).to.eql(vorSommerzeit.value);
    });
  });

  describe("Differenz", () => {
    const januar01 = DatumUhrzeit.forISOString("2019-01-01");
    const januar31 = DatumUhrzeit.forISOString("2019-01-31");

    it("in Tagen", () => {
      expect(januar31.differenzInTagen(januar01)).to.eql(30);
      expect(januar01.differenzInTagen(januar31)).to.eql(-30);
    });
  });

  describe("formatting", () => {
    const januar01 = DatumUhrzeit.forISOString("2019-01-01");

    it("formatiert nur den Monat", () => {
      expect(januar01.monatLang).to.eql("Januar");
    });

    it("formatiert nur den Monat kompakt", () => {
      expect(januar01.monatKompakt).to.eql("Jan.");
    });

    it("formatiert Tag Monat Jahr", () => {
      expect(januar01.tagMonatJahrLang).to.eql("1. Januar 2019");
    });

    it("formatiert Wochentag Tag und Monat mit KW", () => {
      expect(januar01.tagMonatJahrLangMitKW).to.eql("1. Januar 2019 (KW 01)");
    });

    it("formatiert Tag Monat Jahr kompakt", () => {
      expect(januar01.tagMonatJahrKompakt).to.eql("01.01.2019");
    });

    it("formatiert Monat Jahr kompakt", () => {
      expect(januar01.monatJahrKompakt).to.eql("Jan. '19");
    });

    it("formatiert Monat lang Jahr kompakt", () => {
      expect(januar01.monatLangJahrKompakt).to.eql("Januar '19");
    });

    it("formatiert für Kalender Anzeige", () => {
      expect(januar01.fuerKalenderViews).to.eql("2019/01");
    });

    it("formatiert für Calendar Widget", () => {
      expect(januar01.fuerCalendarWidget).to.eql("2019-01-01");
    });

    it("formatiert mit Uhrzeit", () => {
      expect(januar01.mitUhrzeitNumerisch).to.eql("01.01.19 00:00");
    });

    it("formatiert fuer Unterseiten der Veranstaltungen", () => {
      expect(januar01.fuerUnterseiten).to.eql("1901");
    });

    it("formatiert die Uhrzeit", () => {
      expect(januar01.uhrzeitKompakt).to.eql("00:00");
    });

    it("formatiert alles", () => {
      expect(januar01.lesbareLangform).to.eql("Dienstag, 1. Januar 2019 00:00");
    });

    it("formatiert alles kompakt", () => {
      expect(januar01.lesbareKurzform).to.eql("Di., 1. Jan. 2019 00:00");
    });

    it("formatiert Wochentag Tag und Monat", () => {
      expect(januar01.wochentagTagMonat).to.eql("Di. 01. Januar");
    });

    it("formatiert für Presse", () => {
      expect(januar01.fuerPresse).to.eql("Dienstag, 1. Januar 2019 um 00:00");
    });

    it("formatiert für iCal", () => {
      expect(januar01.fuerIcal).to.eql("20181231T230000Z");
    });
  });

  describe("Vergleiche", () => {
    const januar01 = DatumUhrzeit.forISOString("2019-01-01");
    const februar01 = DatumUhrzeit.forISOString("2019-02-01");

    it("kleiner", () => {
      expect(januar01.istVor(februar01)).to.be.true;
    });

    it("grösser", () => {
      expect(februar01.istNach(januar01)).to.be.true;
    });

    it("formatiert Monat Jahr kompakt", () => {
      expect(januar01.monatJahrKompakt).to.eql("Jan. '19");
    });
  });

  describe("Spezialmethoden", () => {
    it("findet vorhergehenden oder aktuellen ungeraden Monat", () => {
      expect(DatumUhrzeit.forISOString("2020-04-30").vorigerOderAktuellerUngeraderMonat.value).to.eql(
        DatumUhrzeit.forISOString("2020-03-30").value
      );
      expect(DatumUhrzeit.forISOString("2020-03-20").vorigerOderAktuellerUngeraderMonat.value).to.eql(
        DatumUhrzeit.forISOString("2020-03-20").value
      );
      expect(DatumUhrzeit.forISOString("2020-02-29").vorigerOderAktuellerUngeraderMonat.value).to.eql(
        DatumUhrzeit.forISOString("2020-01-29").value
      );
      expect(DatumUhrzeit.forISOString("2020-01-20").vorigerOderAktuellerUngeraderMonat.value).to.eql(
        DatumUhrzeit.forISOString("2020-01-20").value
      );
      expect(DatumUhrzeit.forISOString("2020-12-31").vorigerOderAktuellerUngeraderMonat.value).to.eql(
        DatumUhrzeit.forISOString("2020-11-30").value
      );
      expect(DatumUhrzeit.forISOString("2020-11-20").vorigerOderAktuellerUngeraderMonat.value).to.eql(
        DatumUhrzeit.forISOString("2020-11-20").value
      );
    });

    it("findet nächsten ungeraden Monat", () => {
      expect(DatumUhrzeit.forISOString("2020-04-30").naechsterUngeraderMonat.value).to.eql(DatumUhrzeit.forISOString("2020-05-30").value);
      expect(DatumUhrzeit.forISOString("2020-03-31").naechsterUngeraderMonat.value).to.eql(DatumUhrzeit.forISOString("2020-05-31").value);
      expect(DatumUhrzeit.forISOString("2020-02-29").naechsterUngeraderMonat.value).to.eql(DatumUhrzeit.forISOString("2020-03-29").value);
      expect(DatumUhrzeit.forISOString("2020-01-31").naechsterUngeraderMonat.value).to.eql(DatumUhrzeit.forISOString("2020-03-31").value);
      expect(DatumUhrzeit.forISOString("2020-12-31").naechsterUngeraderMonat.value).to.eql(DatumUhrzeit.forISOString("2021-01-31").value);
      expect(DatumUhrzeit.forISOString("2020-11-30").naechsterUngeraderMonat.value).to.eql(DatumUhrzeit.forISOString("2021-01-30").value);
    });

    it("findet gerade Monate", () => {
      expect(DatumUhrzeit.forISOString("2020-04-30").istGeraderMonat).to.be.true;
      expect(DatumUhrzeit.forISOString("2020-11-30").istGeraderMonat).to.be.false;
    });
  });

  describe("getSet", () => {
    it("zugriff auf felder", () => {
      const januar01 = DatumUhrzeit.forISOString("2019-01-01");

      expect(januar01.monat).to.eql(1); // zero based
      expect(januar01.jahr).to.eql(2019);
      expect(januar01.wochentag).to.eql(2); // Montag ist 1
      expect(januar01.tag).to.eql(1);
      expect(januar01.kw).to.eql(1);
    });

    it("setzen der felder", () => {
      const januar01 = DatumUhrzeit.forISOString("2019-01-01");
      const januar05 = DatumUhrzeit.forISOString("2019-01-05");

      expect(januar01.setTag(5).value).to.eql(januar05.value);
      expect(januar01.setUhrzeit(5, 23).value).to.eql(DatumUhrzeit.forISOString("2019-01-01T05:23:00").value);
    });
  });
});
