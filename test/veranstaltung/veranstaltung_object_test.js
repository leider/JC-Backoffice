'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const Veranstaltung = beans.get('veranstaltung');

describe('Veranstaltung', () => {

  it('ist zusammengesetzt aus Unterobjekten', () => {
    const parts = {
      agentur: 'agentur',
      artist: 'artist',
      eintrittspreise: 'eintrittspreise',
      hotel: 'hotel',
      kasse: 'kasse',
      kopf: 'kopf',
      kosten: 'kosten',
      presse: 'presse',
      staff: 'staff',
      unterkunft: 'unterkunft',
      vertrag: 'vertrag'
    };

    const veranstaltung = new Veranstaltung(parts);
    expect(veranstaltung.state.agentur).to.be('agentur');
    expect(veranstaltung.state.artist).to.be('artist');
    expect(veranstaltung.state.eintrittspreise).to.be('eintrittspreise');
    expect(veranstaltung.state.hotel).to.be('hotel');
    expect(veranstaltung.state.kasse).to.be('kasse');
    expect(veranstaltung.state.kopf).to.be('kopf');
    expect(veranstaltung.state.kosten).to.be('kosten');
    expect(veranstaltung.state.presse).to.be('presse');
    expect(veranstaltung.state.staff).to.be('staff');
    expect(veranstaltung.state.unterkunft).to.be('unterkunft');
    expect(veranstaltung.state.vertrag).to.be('vertrag');
  });

  it('initialisiert die Unterobjekte', () => {
    const veranstaltung = new Veranstaltung();
    expect(veranstaltung.state.agentur).to.eql({});
    expect(veranstaltung.state.artist).to.eql({});
    expect(veranstaltung.state.eintrittspreise).to.eql({});
    expect(veranstaltung.state.hotel).to.eql({});
    expect(veranstaltung.state.kasse).to.eql({});
    expect(veranstaltung.state.kopf).to.eql({});
    expect(veranstaltung.state.kosten).to.eql({});
    expect(veranstaltung.state.presse).to.eql({});
    expect(veranstaltung.state.staff).to.eql({});
    expect(veranstaltung.state.unterkunft).to.eql({});
    expect(veranstaltung.state.vertrag).to.eql({});
  });

  it('hat auch noch eigene Felder', () => {
    const veranstaltung = new Veranstaltung({
      id: 'id',
      url: 'url',
      startDate: 'start',
      endDate: 'end'
    });
    expect(veranstaltung.state.id).to.be('id');
    expect(veranstaltung.state.url).to.be('url');
    expect(veranstaltung.state.startDate).to.be('start');
    expect(veranstaltung.state.endDate).to.be('end');
  });

});
