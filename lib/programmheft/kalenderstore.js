const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const persistence = beans.get('kalenderPersistence');
const Kalender = beans.get('kalender');

function toKalenderValues(callback, id, err, jsobject) {
  return misc.toObject(Kalender, callback, err, jsobject || { id });
}

module.exports = {
  getKalender: function getKalender(id, callback) {
    persistence.getById(id, R.partial(toKalenderValues, [callback, id]));
  },

  saveKalender: function saveKalender(kalender, callback) {
    persistence.save(kalender.state, callback);
  },

  getCurrentKalender: function getCurrentKalender(aDatumUhrzeit, callback) {
    this.getKalender(
      aDatumUhrzeit.vorigerOderAktuellerUngeraderMonat().fuerKalenderViews(),
      callback
    );
  },

  getNextKalender: function getNextKalender(aDatumUhrzeit, callback) {
    this.getKalender(
      aDatumUhrzeit.naechsterUngeraderMonat().fuerKalenderViews(),
      callback
    );
  }
};
