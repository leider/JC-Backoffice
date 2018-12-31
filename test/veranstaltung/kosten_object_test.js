'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const Kosten = beans.get('kosten');

describe('Kosten', () => {

  it('funktioniert auf allen Methoden auch mit "null" values', () => {
    const kosten = new Kosten({});
    expect(kosten.gagenTotalEUR()).to.be(0);
    expect(kosten.backlineUndTechnikEUR()).to.be(0);
    expect(kosten.totalEUR()).to.be(0);

    expect(kosten.dealAlsFaktor()).to.be(0);
  });

});
