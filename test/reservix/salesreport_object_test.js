'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const Salesreport = beans.get('salesreport');

const fullresult = require('../testdata/salesreport_1060034.json');

describe.only('Reservix Salesreport', () => {

  it('can parse a result', () => {
    const obj = Salesreport.forRawResult('1060034', fullresult);
    expect(obj.bruttoUmsatz()).to.eql(56);
    expect(obj.gebuehren()).to.eql(4.46);
    expect(obj.anzahlRegulaer()).to.eql(2);
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
    it('returns null if IDs do not match', () => {
      const obj = Salesreport.forRawResult('', fullresult);
      expect(obj).to.be.null();
    });

    it('returns null if structure does not match', () => {
      const obj = Salesreport.forRawResult(1060034, {});
      expect(obj).to.be.null();
    });

    it('returns null if structure does not match (2)', () => {
      const obj = Salesreport.forRawResult(1060034, {data: []});
      expect(obj).to.be.null();
    });

    it('returns null if structure does not match (3)', () => {
      const obj = Salesreport.forRawResult(1060034, {data: [{}]});
      expect(obj).to.be.null();
    });

    it('returns an object if event with id exists (num/num)', () => {
      const obj = Salesreport.forRawResult(1060034, {data: [{eventId: 1060034}]});
      expect(obj).to.be.not.null();
    });

    it('returns an object if event with id exists (num/str)', () => {
      const obj = Salesreport.forRawResult(1060034, {data: [{eventId: '1060034'}]});
      expect(obj).to.be.not.null();
    });

    it('returns an object if event with id exists (str/num)', () => {
      const obj = Salesreport.forRawResult('1060034', {data: [{eventId: 1060034}]});
      expect(obj).to.be.not.null();
    });

    it('returns an object if event with id exists (str/str)', () => {
      const obj = Salesreport.forRawResult('1060034', {data: [{eventId: '1060034'}]});
      expect(obj).to.be.not.null();
    });
  });

});
