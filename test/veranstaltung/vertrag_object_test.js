'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const Vertrag = beans.get('vertrag');

describe('Vertrag', () => {

  it('hat drei verschiedene Workflows', () => {
    const vertragsarten = Vertrag.arten();
    expect(vertragsarten).to.have.length(3);
    expect(vertragsarten.includes('Jazzclub')).to.be(true);
    expect(vertragsarten.includes('Agentur/Künstler')).to.be(true);
    expect(vertragsarten.includes('JazzClassix')).to.be(true);
  });

  it('jeder Workflow hat den "Rider geprüft" Schritt', () => {
    function riderIstInArt(art) {
      const workflow = new Vertrag({art: art}).workflow();
      expect(workflow.includes('Rider akzeptiert')).to.be(true);
    }

    Vertrag.arten().forEach(art => riderIstInArt(art));
  });

  it('der Jazzclub Workflow hat fünf Schritte', () => {
    const workflow = new Vertrag({art: 'Jazzclub'}).workflow();

    expect(workflow).to.have.length(4);
    expect(workflow.includes('erstellt')).to.be(true);
    expect(workflow.includes('versendet')).to.be(true);
    expect(workflow.includes('abgeschlossen')).to.be(true);
  });

  it('der Agentur Workflow hat sieben Schritte', () => {
    const workflow = new Vertrag({art: 'Agentur/Künstler'}).workflow();

    expect(workflow).to.have.length(6);
    expect(workflow.includes('erhalten')).to.be(true);
    expect(workflow.includes('geprüft')).to.be(true);
    expect(workflow.includes('geändert')).to.be(true);
    expect(workflow.includes('akzeptiert')).to.be(true);
    expect(workflow.includes('abgeschlossen')).to.be(true);
  });

  it('der JazzClassix Workflow hat zwei Schritte', () => {
    const workflow = new Vertrag({art: 'JazzClassix'}).workflow();

    expect(workflow).to.have.length(1);
  });
});
