'use strict';

const expect = require('must-dist');
const moment = require('moment-timezone');

const beans = require('../../configure').get('beans');
const Salesreport = beans.get('salesreport');

const fullresult = require('../testdata/salesreport_1060034.json');

describe('Reservix Salesreport', () => {
  it('can parse a result', () => {
    const obj = Salesreport.forRawResult('1060034', fullresult);
    expect(obj.bruttoUmsatz()).to.eql(56);
    expect(obj.gebuehren()).to.eql(4.46);
    expect(obj.anzahlRegulaer()).to.eql(2);
    expect(obj.id()).to.eql('1060034');
    expect(obj.timestamp()).to.eql('2017-08-05T12:41:38+02:00');
  });

  it('handles non-existing sales', () => {
    const obj = new Salesreport({});
    expect(obj.verkaeufe()).to.eql({
      salesWithFees: 0,
      bookingFees: 0
    });
  });

  it('handles non-existing bruttoUmsatz', () => {
    const obj = new Salesreport({sales: {aggregation: {}}});
    expect(obj.bruttoUmsatz()).to.be(0);
  });

  it('handles non-existing gebuehren', () => {
    const obj = new Salesreport({sales: {aggregation: {}}});
    expect(obj.gebuehren()).to.be(0);
  });

  describe('validation', () => {
    function isNullObject(obj) {
      expect(obj.verkaeufe()).to.eql({'salesWithFees': 0, 'bookingFees': 0});
      expect(obj.id()).to.be(undefined);
    }

    it('returns null Object if IDs do not match', () => {
      isNullObject(Salesreport.forRawResult('', fullresult));
    });

    it('returns null Object if structure does not match', () => {
      isNullObject(Salesreport.forRawResult(1060034, {}));
    });

    it('returns null Object if structure does not match (2)', () => {
      isNullObject(Salesreport.forRawResult(1060034, {data: []}));
    });

    it('returns null Object if structure does not match (3)', () => {
      isNullObject(Salesreport.forRawResult(1060034, {data: [{}]}));
    });

    it('returns an object if event with id exists (num/num)', () => {
      const obj = Salesreport.forRawResult(1060034, {data: [{eventId: 1060034}]});
      expect(obj.id()).to.eql('1060034');
    });

    it('returns an object if event with id exists (num/str)', () => {
      const obj = Salesreport.forRawResult(1060034, {data: [{eventId: '1060034'}]});
      expect(obj.id()).to.eql('1060034');
    });

    it('returns an object if event with id exists (str/num)', () => {
      const obj = Salesreport.forRawResult('1060034', {data: [{eventId: 1060034}]});
      expect(obj.id()).to.eql('1060034');
    });

    it('returns an object if event with id exists (str/str)', () => {
      const obj = Salesreport.forRawResult('1060034', {data: [{eventId: '1060034'}]});
      expect(obj.id()).to.eql('1060034');
    });
  });

  describe('istVeraltet', () => {
    it('correctly checks an old timestamp', () => {
      const obj = Salesreport.forRawResult('1060034', {
        tsServer: '2017-08-05 12:41:38',
        data: [{eventId: 1060034}]
      });
      expect(obj.istVeraltet()).to.be(true);
    });

    it('correctly checks a young timestamp', () => {
      const now = moment();
      const obj = Salesreport.forRawResult('1060034', {
        tsServer: now.format('YYYY-MM-DD HH:mm:ss'),
        data: [{eventId: 1060034}]
      });
      expect(obj.istVeraltet()).to.be(false);
    });

    it('correctly checks an almost young timestamp', () => {
      const now = moment();
      now.subtract(59, 'minutes');
      const obj = Salesreport.forRawResult('1060034', {
        tsServer: now.format('YYYY-MM-DD HH:mm:ss'),
        data: [{eventId: 1060034}]
      });
      expect(obj.istVeraltet()).to.be(false);
    });

    it('correctly checks a just too old timestamp', () => {
      const now = moment();
      now.subtract(61, 'minutes');
      const obj = Salesreport.forRawResult('1060034', {
        tsServer: now.format('YYYY-MM-DD HH:mm:ss'),
        data: [{
          eventId: 1060034,
          startDate: '2021-10-26',
          startTime: '19:30:00'
        }]
      });
      expect(obj.istVeraltet()).to.be(true);
    });

    it('correctly checks for a past event - it is never too old', () => {
      const obj = Salesreport.forRawResult('1060034', {
        tsServer: '2017-08-05 12:41:38',
        data: [{
          eventId: 1060034,
          startDate: '2016-10-26',
          startTime: '19:30:00'
        }]
      });
      expect(obj.istVeraltet()).to.be(false);
    });
  });

  it('knows that it is a past event', () => {
    const obj = Salesreport.forRawResult('1060034', {
      tsServer: '2022-08-05 12:41:38',
      data: [{
        eventId: 1060034,
        startDate: '2016-10-26',
        startTime: '19:30:00'
      }]
    });
    expect(obj.istVergangen()).to.be(true);
  });
});
