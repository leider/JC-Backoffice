'use strict';

const expect = require('must-dist');
const moment = require('moment-timezone');

const beans = require('../../configure').get('beans');
const Salesreport = beans.get('salesreport');

const heute = moment().add(8, 'hours').toDate();
const tomorrow = moment().add(1, 'days').toDate();

const thirtyMinutesAgo = moment().subtract(30, 'minutes').toDate();
const oneHourAgo = moment().subtract(61, 'minutes').toDate();
const almostOneDayOld = moment().subtract(23, 'hours').toDate();
const moreThanOneDayOld = moment().subtract(25, 'hours').toDate();

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
    expect(obj.updated().toLocalDateTimeString()).to.eql('28.10.2018, 13:58:23');
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
        datum: tomorrow,
        updated: oneHourAgo
      });
      expect(obj.istVeraltet()).to.be(true);
    });

    it('correctly checks a very old Veranstaltung', () => {
      const obj = new Salesreport(fullresult);
      expect(obj.istVeraltet()).to.be(false);
    });

    it('correctly checks an almost young timestamp', () => {
      const obj = new Salesreport({updated: thirtyMinutesAgo});
      expect(obj.istVeraltet()).to.be(false);
    });

    it('correctly checks for a near event - more often updates', () => {
      const obj = new Salesreport({
        datum: heute,
        updated: thirtyMinutesAgo
      });
      expect(obj.istVeraltet()).to.be(true);
    });

  });

  describe('istVergangen', () => {
    it('23 hours are in grace period', () => {
      const obj = new Salesreport({
        datum: almostOneDayOld,
      });
      expect(obj.istVergangen()).to.be(false);
    });

    it('25 hours are definitely over', () => {
      const obj = new Salesreport({
        datum: moreThanOneDayOld
      });
      expect(obj.istVergangen()).to.be(true);
    });

    it('2017 is past', () => {
      const obj = new Salesreport({
        datum: new Date('2017-10-27T12:58:23.072Z')
      });
      expect(obj.istVergangen()).to.be(true);
    });

  });
});
