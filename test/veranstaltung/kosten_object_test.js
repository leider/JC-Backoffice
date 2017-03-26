'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const Kosten = beans.get('kosten');

describe('Kosten', () => {

  it('funktioniert auf allen Methoden auch mit "null" values', () => {
    const kosten = new Kosten({});
    expect(kosten.agenturEUR()).to.be(0);
    expect(kosten.agenturMWSt()).to.be.undefined();

    expect(kosten.agenturTotalEUR()).to.be(0);
    expect(kosten.bandTotalEUR()).to.be(0);
    expect(kosten.cateringTotalEUR()).to.be(0);
    expect(kosten.totalEUR()).to.be(0);

    expect(kosten.dealAlsFaktor()).to.be(0);
  });

});
