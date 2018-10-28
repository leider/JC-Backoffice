'use strict';

const expect = require('must-dist');
const moment = require('moment-timezone');

const beans = require('../../configure').get('beans');
const Salesreport = beans.get('salesreport');

const fullresult = {
  id: '1008242',
  datum: new Date('2017-05-22T18:00:00.000Z'),
  anzahl: 220,
  netto: 4782.55,
  brutto: 5296,
  updated: new Date('2018-10-28T12:58:23.072Z')
};

describe('Reservix Salesreport', () => {
  it('can parse a result', () => {
    const obj = new Salesreport(fullresult);
    expect(obj.bruttoUmsatz()).to.eql(5296);
    expect(obj.nettoUmsatz()).to.eql(4782.55);
    expect(obj.gebuehren()).to.eql(5296 - 4782.55);
    expect(obj.anzahlRegulaer()).to.eql(220);
    expect(obj.id()).to.eql('1008242');
    expect(obj.timestamp()).to.eql('2018-10-28T13:58:23+01:00');
  });

  it('handles non-existing bruttoUmsatz', () => {
    const obj = new Salesreport({});
    expect(obj.bruttoUmsatz()).to.be(0);
  });

  it('handles non-existing gebuehren', () => {
    const obj = new Salesreport({});
    expect(obj.gebuehren()).to.be(0);
  });

  describe('istVeraltet', () => {
    it('correctly checks an old timestamp', () => {
      const obj = new Salesreport({
        datum: new Date('2020-05-22T18:00:00.000Z'),
        updated: new Date('2018-10-27T12:58:23.072Z')
      });
      expect(obj.istVeraltet()).to.be(true);
    });

    it('correctly checks a young timestamp', () => {
      const obj = new Salesreport(fullresult);
      expect(obj.istVeraltet()).to.be(false);
    });

    it('correctly checks an almost young timestamp', () => {
      const now = moment();
      now.subtract(59, 'minutes');
      const obj = new Salesreport({updated: now.toDate()});
      expect(obj.istVeraltet()).to.be(false);
    });

    it('correctly checks a just too old timestamp', () => {
      const now = moment();
      now.subtract(61, 'minutes');
      const obj = new Salesreport({
        updated: now.toDate(),
        datum: new Date('2020-10-27T12:58:23.072Z')
      });
      expect(obj.istVeraltet()).to.be(true);
    });

    it('correctly checks for a past event - it is never too old', () => {
      const obj = new Salesreport({
        datum: new Date('2020-10-27T12:58:23.072Z')
      });
      expect(obj.istVeraltet()).to.be(false);
    });
  });
});
