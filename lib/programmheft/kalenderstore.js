const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const persistence = beans.get('kalenderPersistence');
const Kalender = beans.get('kalender');

function toKalenderValues(callback, err, jsobject) {
  return misc.toObject(Kalender, callback, err, jsobject);
}

module.exports = {
  getKalender: function getKalender(id, callback) {
    persistence.getById(id, R.partial(toKalenderValues, [callback]));
  },

  saveKalender: function saveKalender(kalender, callback) {
    persistence.save(kalender.state, callback);
  },

  getCurrentKalender: function getCurrentKalender(aMoment, callback) {
    this.getKalender(misc.vorigerOderAktuellerUngeraderMonat(aMoment).format('YYYY/MM'), callback);
  },

  getNextKalender: function getNextKalender(aMoment, callback) {
    this.getKalender(misc.naechsterUngeraderMonat(aMoment).format('YYYY/MM'), callback);
  }
};