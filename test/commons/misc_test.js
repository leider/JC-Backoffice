'use strict';

const moment = require('moment-timezone');
const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const misc = beans.get('misc');

describe('Misc', () => {

  it('findet vorhergehenden oder aktuellen ungeraden Monat', () => {
    expect(misc.vorigerOderAktuellerUngeraderMonat(moment('2020-04-30'))).to.eql(moment('2020-03-30'));
    expect(misc.vorigerOderAktuellerUngeraderMonat(moment('2020-03-20'))).to.eql(moment('2020-03-20'));
    expect(misc.vorigerOderAktuellerUngeraderMonat(moment('2020-02-29'))).to.eql(moment('2020-01-29'));
    expect(misc.vorigerOderAktuellerUngeraderMonat(moment('2020-01-20'))).to.eql(moment('2020-01-20'));
    expect(misc.vorigerOderAktuellerUngeraderMonat(moment('2020-12-31'))).to.eql(moment('2020-11-30'));
    expect(misc.vorigerOderAktuellerUngeraderMonat(moment('2020-11-20'))).to.eql(moment('2020-11-20'));
  });

  it('findet mächsten ungeraden Monat', () => {
    expect(misc.naechsterUngeraderMonat(moment('2020-04-30'))).to.eql(moment('2020-05-30'));
    expect(misc.naechsterUngeraderMonat(moment('2020-03-31'))).to.eql(moment('2020-05-31'));
    expect(misc.naechsterUngeraderMonat(moment('2020-02-29'))).to.eql(moment('2020-03-29'));
    expect(misc.naechsterUngeraderMonat(moment('2020-01-31'))).to.eql(moment('2020-03-31'));
    expect(misc.naechsterUngeraderMonat(moment('2020-12-31'))).to.eql(moment('2021-01-31'));
    expect(misc.naechsterUngeraderMonat(moment('2020-11-30'))).to.eql(moment('2021-01-30'));
  });

});

