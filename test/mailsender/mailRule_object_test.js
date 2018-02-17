'use strict';

const expect = require('must-dist');
const moment = require('moment-timezone');
const beans = require('../../configure').get('beans');
const MailRule = beans.get('mailRule');

describe('MailRule', () => {
  const jan5 = moment('2018-01-05');
  const jan20 = moment('2018-01-20');
  const montagFeb5 = moment('2018-02-05');
  const dienstagFeb13 = moment('2018-02-13');
  const mittwochFeb14 = moment('2018-02-14');
  const feb20 = moment('2018-02-20');
  const montagFeb26 = moment('2018-02-26');

  describe('Regel 1 \'Mittwochs für die nächste Woche\'', () => {
    const rule = new MailRule({
      id: 'someID',
      name: 'test',
      email: 'aa@bb.cc',
      rule: MailRule.rules()[1]
    });

    it('sendet nur Mittowchs', () => {
      expect(rule.shouldSend(mittwochFeb14)).to.be(true);
      expect(rule.shouldSend(dienstagFeb13)).to.be(false);
    });

    it('errechnet Beginn und Ende korrekt', () => {
      const result = rule.startAndEndDay(mittwochFeb14);
      expect(result.start).to.eql(moment('2018-02-19'));
      expect(result.end).to.eql(moment('2018-02-25'));
    });

    it('gibt das Eingabedatum zurück, wenn nichts gesendet werden soll', () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start).to.eql(dienstagFeb13);
      expect(result.end).to.eql(dienstagFeb13);
    });

  });

  describe('Regel 2 \'Am 5. den Folgemonat\'', () => {
    const rule = new MailRule({
      id: 'someID',
      name: 'test',
      email: 'aa@bb.cc',
      rule: MailRule.rules()[2]
    });

    it('sendet nur am 5.', () => {
      expect(rule.shouldSend(montagFeb5)).to.be(true);
      expect(rule.shouldSend(dienstagFeb13)).to.be(false);
    });

    it('errechnet Beginn und Ende für Februar korrekt', () => {
      const result = rule.startAndEndDay(jan5);
      expect(result.start).to.eql(moment('2018-02-01'));
      expect(result.end).to.eql(moment('2018-02-28'));
    });

    it('errechnet Beginn und Ende für März korrekt', () => {
      const result = rule.startAndEndDay(montagFeb5);
      expect(result.start).to.eql(moment('2018-03-01'));
      expect(result.end).to.eql(moment('2018-03-31'));
    });

    it('gibt das Eingabedatum zurück, wenn nichts gesendet werden soll', () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start).to.eql(dienstagFeb13);
      expect(result.end).to.eql(dienstagFeb13);
    });

  });

  describe('Regel 3 \'Am 20. den Folgemonat ab 15.\'', () => {
    const rule = new MailRule({
      id: 'someID',
      name: 'test',
      email: 'aa@bb.cc',
      rule: MailRule.rules()[3]
    });

    it('sendet nur am 20.', () => {
      expect(rule.shouldSend(feb20)).to.be(true);
      expect(rule.shouldSend(dienstagFeb13)).to.be(false);
    });

    it('errechnet Beginn und Ende für Februar korrekt', () => {
      const result = rule.startAndEndDay(jan20);
      expect(result.start).to.eql(moment('2018-02-15'));
      expect(result.end).to.eql(moment('2018-03-15'));
    });

    it('errechnet Beginn und Ende für März korrekt', () => {
      const result = rule.startAndEndDay(feb20);
      expect(result.start).to.eql(moment('2018-03-15'));
      expect(result.end).to.eql(moment('2018-04-15'));
    });

    it('gibt das Eingabedatum zurück, wenn nichts gesendet werden soll', () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start).to.eql(dienstagFeb13);
      expect(result.end).to.eql(dienstagFeb13);
    });

  });

  describe('Regel 4 \'Montags die Folgewoche ab Freitag\'', () => {
    const rule = new MailRule({
      id: 'someID',
      name: 'test',
      email: 'aa@bb.cc',
      rule: MailRule.rules()[4]
    });

    it('sendet nur Montags', () => {
      expect(rule.shouldSend(montagFeb5)).to.be(true);
      expect(rule.shouldSend(dienstagFeb13)).to.be(false);
    });

    it('errechnet Beginn und Ende im Februar korrekt', () => {
      const result = rule.startAndEndDay(montagFeb5);
      expect(result.start).to.eql(moment('2018-02-09'));
      expect(result.end).to.eql(moment('2018-02-16'));
    });

    it('errechnet Beginn und Ende monatsübergreifend korrekt', () => {
      const result = rule.startAndEndDay(montagFeb26);
      expect(result.start).to.eql(moment('2018-03-02'));
      expect(result.end).to.eql(moment('2018-03-09'));
    });

    it('gibt das Eingabedatum zurück, wenn nichts gesendet werden soll', () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start).to.eql(dienstagFeb13);
      expect(result.end).to.eql(dienstagFeb13);
    });

  });
  describe('Regel 5 \'Am 5. zwei Folgemonate\'', () => {
    const rule = new MailRule({
      id: 'someID',
      name: 'test',
      email: 'aa@bb.cc',
      rule: MailRule.rules()[5]
    });

    it('sendet nur am 5.', () => {
      expect(rule.shouldSend(montagFeb5)).to.be(true);
      expect(rule.shouldSend(dienstagFeb13)).to.be(false);
    });

    it('errechnet Beginn und Ende für Februar korrekt', () => {
      const result = rule.startAndEndDay(jan5);
      expect(result.start).to.eql(moment('2018-02-01'));
      expect(result.end).to.eql(moment('2018-03-31'));
    });

    it('errechnet Beginn und Ende für März korrekt', () => {
      const result = rule.startAndEndDay(montagFeb5);
      expect(result.start).to.eql(moment('2018-03-01'));
      expect(result.end).to.eql(moment('2018-04-30'));
    });

    it('gibt das Eingabedatum zurück, wenn nichts gesendet werden soll', () => {
      const result = rule.startAndEndDay(dienstagFeb13);
      expect(result.start).to.eql(dienstagFeb13);
      expect(result.end).to.eql(dienstagFeb13);
    });

  });

});
