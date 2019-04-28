'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const DatumUhrzeit = beans.get('DatumUhrzeit');

describe('DatumUhrzeit', () => {
  const festesDatum = new Date(2019, 3, 30, 13, 43, 30); // month is zero based like java

  it('kann ohne Parameter erzeugt werden', () => {
    const aktMonat = new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(
      new Date()
    );

    expect(new DatumUhrzeit().monatLang()).to.eql(aktMonat);
  });

  it('kann mit Parameter erzeugt werden', () => {
    expect(new DatumUhrzeit(festesDatum).toLocalDateTimeString()).to.eql(
      '30.04.2019, 13:43:30'
    );
    expect(new DatumUhrzeit(festesDatum).toJSDate()).to.be(festesDatum);
  });

  it('kann mit String "YYMM" erzeugt werden', () => {
    expect(DatumUhrzeit.forYYMM('1903').toLocalDateTimeString()).to.eql(
      '01.03.2019, 00:00:00'
    );
  });

  it('kann mit ISO String erzeugt werden', () => {
    expect(DatumUhrzeit.forISOString('2019-03-01T00:00:00+01:00').toLocalDateTimeString()).to.eql(
      '01.03.2019, 00:00:00'
    );
  });

  describe('plus und minus mit immutability', () => {
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
      expect(januar01.toLocalDateTimeString()).to.eql('01.01.2019, 01:00:00');
    });

    it('rechnet mit Monaten am Monatsletzten', () => {
      expect(januar31.plus({ monate: 1 })).to.eql(februar28);
      expect(maerz31.minus({ monate: 1 })).to.eql(februar28);
    });

    it('rechnet mit Tagen', () => {
      expect(januar01.plus({ tage: 31 })).to.eql(februar01);
      expect(februar01.plus({ tage: 31 })).to.eql(maerz04);
      expect(januar01.toLocalDateTimeString()).to.eql('01.01.2019, 01:00:00');
    });

    it('rechnet mit Monaten und Tagen', () => {
      expect(januar31.plus({ monate: 1, tage: 4 })).to.eql(maerz04);
      expect(maerz04.minus({ monate: 1, tage: 4 })).to.eql(januar31);
      expect(januar31.toLocalDateTimeString()).to.eql('31.01.2019, 01:00:00');
    });

    it('rechnet mit Jahren', () => {
      expect(januar01.plus({ jahre: 10 })).to.eql(januar0129);
      expect(januar0129.minus({ jahre: 10 })).to.eql(januar01);
      expect(januar01.toLocalDateTimeString()).to.eql('01.01.2019, 01:00:00');
    });
  });
});
