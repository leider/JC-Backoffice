const expect = require('must-dist');
import Orte from '../../lib/optionen/orte';

describe('Orte', () => {
  it('is properly initialized', () => {
    const orte = new Orte({});
    expect(orte.orte).to.eql([]);
  });

  it('can add an ort', () => {
    const orte = new Orte({});
    orte.addOrt({ name: 'ort1', flaeche: '100' });
    expect(orte.orte).to.have.length(1);
    const ort = orte.orte[0];
    expect(ort).to.have.keys(['name', 'flaeche']);
    expect(ort.name).to.eql('ort1');
    expect(ort.flaeche).to.eql('100');
  });

  it('can update an ort', () => {
    const orte = new Orte({});
    orte.addOrt({ name: 'ort1', flaeche: '100' });
    orte.updateOrt('ort1', { name: 'ort2', flaeche: '300' });
    expect(orte.orte).to.have.length(1);
    const ort = orte.orte[0];
    expect(ort.name).to.eql('ort2');
    expect(ort.flaeche).to.eql('300');
  });

  it('avoids duplicate names', () => {
    const orte = new Orte({});
    orte.addOrt({ name: 'ort1', flaeche: '100' });
    orte.addOrt({ name: 'ort1', flaeche: '100' });
    expect(orte.orte).to.have.length(1);
    orte.addOrt({ name: 'ort2', flaeche: '100' });
    expect(orte.orte).to.have.length(2);
  });

  it('can delete an ort', () => {
    const orte = new Orte({});
    orte.addOrt({ name: 'ort1', flaeche: '100' });
    orte.deleteOrt('ort1');
    expect(orte.orte).to.have.length(0);
  });

  it('can deletes nothing when name empty or not in orte', () => {
    const orte = new Orte({});
    orte.addOrt({ name: 'ort1', flaeche: '100' });
    orte.deleteOrt('');
    orte.deleteOrt();
    orte.deleteOrt('nicht da');
    expect(orte.orte).to.have.length(1);
  });
});
