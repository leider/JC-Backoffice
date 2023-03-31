/* eslint-disable no-unused-expressions*/
import { expect } from "chai";
import MailRule, { allMailrules } from "../../mail/mailRule.js";
import DatumUhrzeit from "../../commons/DatumUhrzeit.js";

describe("MailRule", () => {
  const jan5 = DatumUhrzeit.forISOString("2018-01-05");
  const jan16 = DatumUhrzeit.forISOString("2018-01-16");
  const montagFeb5 = DatumUhrzeit.forISOString("2018-02-05");
  const dienstagFeb13 = DatumUhrzeit.forISOString("2018-02-13");
  const mittwochFeb14 = DatumUhrzeit.forISOString("2018-02-14");
  const feb16 = DatumUhrzeit.forISOString("2018-02-16");
  const montagFeb26 = DatumUhrzeit.forISOString("2018-02-26");

  describe("Regel 1 'Mittwochs für die nächste Woche'", () => {
    const rule = MailRule.fromJSON({
      id: "someID",
      name: "test",
      email: "aa@bb.cc",
      rule: allMailrules[1],
    });

    it("sendet nur Mittowchs", () => {
      expect(rule.shouldSend(mittwochFeb14)).to.be.true;
      expect(rule.shouldSend(dienstagFeb13)).to.be.false;
    });

    it("errechnet Beginn und Ende korrekt", () => {
      const result = rule.startAndEndDay(mittwochFeb14);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-02-19").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-02-25").value);
    });

    it("gibt das Eingabedatum zurück, wenn nichts gesendet werden soll", () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start.value).to.eql(dienstagFeb13.value);
      expect(result.end.value).to.eql(dienstagFeb13.value);
    });
  });

  describe("Regel 2 'Am 5. den Folgemonat'", () => {
    const rule = MailRule.fromJSON({
      id: "someID",
      name: "test",
      email: "aa@bb.cc",
      rule: allMailrules[2],
    });

    it("sendet nur am 5.", () => {
      expect(rule.shouldSend(montagFeb5)).to.be.true;
      expect(rule.shouldSend(dienstagFeb13)).to.be.false;
    });

    it("errechnet Beginn und Ende für Februar korrekt", () => {
      const result = rule.startAndEndDay(jan5);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-02-01").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-02-28").value);
    });

    it("errechnet Beginn und Ende für März korrekt", () => {
      const result = rule.startAndEndDay(montagFeb5);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-03-01").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-03-31").value);
    });

    it("gibt das Eingabedatum zurück, wenn nichts gesendet werden soll", () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start.value).to.eql(dienstagFeb13.value);
      expect(result.end.value).to.eql(dienstagFeb13.value);
    });
  });

  describe("Regel 3 'Am 5. zwei Folgemonate'", () => {
    const rule = MailRule.fromJSON({
      id: "someID",
      name: "test",
      email: "aa@bb.cc",
      rule: allMailrules[3],
    });

    it("sendet nur am 5.", () => {
      expect(rule.shouldSend(montagFeb5)).to.be.true;
      expect(rule.shouldSend(dienstagFeb13)).to.be.false;
    });

    it("errechnet Beginn und Ende für Februar korrekt", () => {
      const result = rule.startAndEndDay(jan5);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-02-01").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-03-31").value);
    });

    it("errechnet Beginn und Ende für März korrekt", () => {
      const result = rule.startAndEndDay(montagFeb5);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-03-01").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-04-30").value);
    });

    it("gibt das Eingabedatum zurück, wenn nichts gesendet werden soll", () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start.value).to.eql(dienstagFeb13.value);
      expect(result.end.value).to.eql(dienstagFeb13.value);
    });
  });

  describe("Regel 4 'Am 20. den Folgemonat ab 15.'", () => {
    const rule = MailRule.fromJSON({
      id: "someID",
      name: "test",
      email: "aa@bb.cc",
      rule: allMailrules[4],
    });

    it("sendet nur am 16.", () => {
      expect(rule.shouldSend(feb16)).to.be.true;
      expect(rule.shouldSend(dienstagFeb13)).to.be.false;
    });

    it("errechnet Beginn und Ende für Februar korrekt", () => {
      const result = rule.startAndEndDay(jan16);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-02-15").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-03-15").value);
    });

    it("errechnet Beginn und Ende für März korrekt", () => {
      const result = rule.startAndEndDay(feb16);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-03-15").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-04-15").value);
    });

    it("gibt das Eingabedatum zurück, wenn nichts gesendet werden soll", () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start.value).to.eql(dienstagFeb13.value);
      expect(result.end.value).to.eql(dienstagFeb13.value);
    });
  });

  describe("Regel 5 'Montags die Folgewoche ab Freitag'", () => {
    const rule = MailRule.fromJSON({
      id: "someID",
      name: "test",
      email: "aa@bb.cc",
      rule: allMailrules[5],
    });

    it("sendet nur Montags", () => {
      expect(rule.shouldSend(montagFeb5)).to.be.true;
      expect(rule.shouldSend(dienstagFeb13)).to.be.false;
    });

    it("errechnet Beginn und Ende im Februar korrekt", () => {
      const result = rule.startAndEndDay(montagFeb5);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-02-09").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-02-16").value);
    });

    it("errechnet Beginn und Ende monatsübergreifend korrekt", () => {
      const result = rule.startAndEndDay(montagFeb26);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-03-02").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-03-09").value);
    });

    it("gibt das Eingabedatum zurück, wenn nichts gesendet werden soll", () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start.value).to.eql(dienstagFeb13.value);
      expect(result.end.value).to.eql(dienstagFeb13.value);
    });
  });

  describe("Regel 6 'Montags die übernächste Folgewoche'", () => {
    const rule = MailRule.fromJSON({
      id: "someID",
      name: "test",
      email: "aa@bb.cc",
      rule: allMailrules[6],
    });

    it("sendet nur Montags", () => {
      expect(rule.shouldSend(montagFeb5)).to.be.true;
      expect(rule.shouldSend(dienstagFeb13)).to.be.false;
    });

    it("errechnet Beginn und Ende im Februar korrekt", () => {
      const result = rule.startAndEndDay(montagFeb5);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-02-19").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-02-26").value);
    });

    it("errechnet Beginn und Ende monatsübergreifend korrekt", () => {
      const result = rule.startAndEndDay(montagFeb26);
      expect(result.start.value).to.eql(DatumUhrzeit.forISOString("2018-03-12").value);
      expect(result.end.value).to.eql(DatumUhrzeit.forISOString("2018-03-19").value);
    });

    it("gibt das Eingabedatum zurück, wenn nichts gesendet werden soll", () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start.value).to.eql(dienstagFeb13.value);
      expect(result.end.value).to.eql(dienstagFeb13.value);
    });
  });
});
