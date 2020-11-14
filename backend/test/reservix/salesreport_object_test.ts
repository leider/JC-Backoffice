import { expect } from "chai";

import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";
import Salesreport from "../../lib/reservix/salesreport";

const now = new DatumUhrzeit();
const heute = now.plus({ stunden: 8 }).toJSDate;
const tomorrow = now.plus({ tage: 1 }).toJSDate;

const thirtyMinutesAgo = now.minus({ minuten: 30 }).toJSDate;
const oneHourAgo = now.minus({ minuten: 61 }).toJSDate;
const almostOneDayOld = now.minus({ stunden: 23 }).toJSDate;
const moreThanOneDayOld = now.minus({ stunden: 25 }).toJSDate;

const fullresult = {
  id: "1008242",
  datum: new Date("2017-05-22T18:00:00.000Z"),
  anzahl: 220,
  netto: 4782.55,
  brutto: 5296,
  updated: new Date("2018-10-28T12:58:23.072Z"),
};

const minimumResult = { id: "dummy" };

describe("Reservix Salesreport", () => {
  it("can parse a result", () => {
    const obj = new Salesreport(fullresult);
    expect(obj.brutto).to.eql(5296);
    expect(obj.netto).to.eql(4782.55);
    expect(obj.gebuehren()).to.eql(5296 - 4782.55);
    expect(obj.anzahl).to.eql(220);
    expect(obj.id).to.eql("1008242");
    expect(obj.zuletztAktualisiert().toLocalDateTimeString).to.eql("28.10.2018, 13:58:23");
  });

  it("handles non-existing bruttoUmsatz", () => {
    const obj = new Salesreport(minimumResult);
    expect(obj.brutto).to.equal(0);
  });

  it("handles non-existing gebuehren", () => {
    const obj = new Salesreport(minimumResult);
    expect(obj.gebuehren()).to.equal(0);
  });

  describe("istVeraltet", () => {
    it("correctly checks an old timestamp", () => {
      const obj = new Salesreport({
        id: "dodo",
        datum: tomorrow,
        updated: oneHourAgo,
      });
      expect(obj.istVeraltet()).to.equal(true);
    });

    it("correctly checks a very old Veranstaltung", () => {
      const obj = new Salesreport(fullresult);
      expect(obj.istVeraltet()).to.equal(false);
    });

    it("correctly checks an almost young timestamp", () => {
      const obj = new Salesreport({ id: "dodo", updated: thirtyMinutesAgo });
      expect(obj.istVeraltet()).to.equal(false);
    });

    it("correctly checks for a near event - more often updates", () => {
      const obj = new Salesreport({
        id: "dodo",
        datum: heute,
        updated: thirtyMinutesAgo,
      });
      expect(obj.istVeraltet()).to.equal(true);
    });
  });

  describe("istVergangen", () => {
    it("23 hours are in grace period", () => {
      const obj = new Salesreport({ id: "dodo", datum: almostOneDayOld });
      expect(obj.istVergangen()).to.equal(false);
    });

    it("25 hours are definitely over", () => {
      const obj = new Salesreport({ id: "dodo", datum: moreThanOneDayOld });
      expect(obj.istVergangen()).to.equal(true);
    });

    it("2017 is past", () => {
      const obj = new Salesreport({
        id: "dodo",
        datum: new Date("2017-10-27T12:58:23.072Z"),
      });
      expect(obj.istVergangen()).to.equal(true);
    });
  });
});
