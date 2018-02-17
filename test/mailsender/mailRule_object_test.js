'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const MailRule = beans.get('mailRule');

describe('MailRule', () => {

  it('berechnet die richtigen Werte, um Events zu laden', () => {
    const kosten = new Kosten({});
    expect(kosten.agenturEUR()).to.be(0);
    expect(kosten.agenturSteuer()).to.be.undefined();

    expect(kosten.agenturTotalEUR()).to.be(0);
    expect(kosten.bandTotalEUR()).to.be(0);
    expect(kosten.backlineUndTechnikEUR()).to.be(0);
    expect(kosten.totalEUR()).to.be(0);

    expect(kosten.dealAlsFaktor()).to.be(0);
  });

});
