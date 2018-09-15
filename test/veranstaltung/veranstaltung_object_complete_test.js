'use strict';

const expect = require('must-dist');

const sinon = require('sinon').createSandbox();

const beans = require('../../configure').get('beans');
const Veranstaltung = beans.get('veranstaltung');

const demo = require('../testdata/veranstaltung.json');
const reference = JSON.parse(JSON.stringify(demo));

describe('Veranstaltung Gesamt', () => {
  let veranstaltung;

  beforeEach(() => {
    veranstaltung = new Veranstaltung(demo);
  });

  it('hat noch eigene Attribute', () => {
    expect(veranstaltung.id()).to.eql(reference.id);
    expect(veranstaltung.url()).to.eql(reference.url);
    expect(veranstaltung.startDate()).to.eql(reference.startDate);
    expect(veranstaltung.endDate()).to.eql(reference.endDate);
  });

  describe('fillFromUI', () => {
    let agenturSpy;
    let artistSpy;
    let eintrittspreiseSpy;
    let hotelSpy;
    let kasseSpy;
    let kopfSpy;
    let kostenSpy;
    let presseSpy;
    let staffSpy;
    let unterkunftSpy;
    let vertragSpy;
    let werbungSpy;

    beforeEach(() => {
      agenturSpy = sinon.spy(veranstaltung, 'agentur');
      artistSpy = sinon.spy(veranstaltung, 'artist');
      eintrittspreiseSpy = sinon.spy(veranstaltung, 'eintrittspreise');
      hotelSpy = sinon.spy(veranstaltung, 'hotel');
      kasseSpy = sinon.spy(veranstaltung, 'kasse');
      kopfSpy = sinon.spy(veranstaltung, 'kopf');
      kostenSpy = sinon.spy(veranstaltung, 'kosten');
      presseSpy = sinon.spy(veranstaltung, 'presse');
      staffSpy = sinon.spy(veranstaltung, 'staff');
      unterkunftSpy = sinon.spy(veranstaltung, 'unterkunft');
      vertragSpy = sinon.spy(veranstaltung, 'vertrag');
      werbungSpy = sinon.spy(veranstaltung, 'werbung');
    });

    it('ist zusammengesetzt aus Unterobjekten', () => {
      veranstaltung.fillFromUI(reference);

      expect(agenturSpy.calledOnce).to.be(true);
      expect(artistSpy.called).to.be(true);
      expect(eintrittspreiseSpy.calledOnce).to.be(true);
      expect(hotelSpy.calledOnce).to.be(true);
      expect(kasseSpy.calledOnce).to.be(true);
      expect(kopfSpy.calledOnce).to.be(true);
      expect(kostenSpy.calledOnce).to.be(true);
      expect(presseSpy.calledOnce).to.be(true);
      expect(staffSpy.calledOnce).to.be(true);
      expect(unterkunftSpy.calledOnce).to.be(true);
      expect(vertragSpy.calledOnce).to.be(true);
      expect(werbungSpy.calledOnce).to.be(true);
    });

    it('ohne kopf oder ohne id bleiben die vorherigen Felder', () => {
      veranstaltung.fillFromUI({agentur: {}});

      expect(veranstaltung.agentur().name()).to.eql(reference.agentur.name);
    });

    it('mit kopf werden die vorherigen Felder überschrieben', () => {
      veranstaltung.fillFromUI({kopf: {}, agentur: {}});

      expect(veranstaltung.agentur().name()).to.be(undefined);
    });

    it('mit id werden die vorherigen Felder überschrieben', () => {
      veranstaltung.fillFromUI({id: 'id', agentur: {}});

      expect(veranstaltung.agentur().name()).to.be(undefined);
    });

  });
});
