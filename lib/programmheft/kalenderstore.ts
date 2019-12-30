import Kalender from './kalender';

import R from 'ramda';

import misc from '../commons/misc';

import pers from '../persistence/persistence';
import DatumUhrzeit from '../commons/DatumUhrzeit';
const persistence = pers('kalenderstore');

function toKalenderValues(
  callback: Function,
  id: string,
  err: Error | null,
  jsobject?: any
) {
  return misc.toObject(Kalender, callback, err, jsobject || { id });
}

export default {
  getKalender: function getKalender(id: string, callback: Function) {
    persistence.getById(id, R.partial(toKalenderValues, [callback, id]));
  },

  saveKalender: function saveKalender(kalender: Kalender, callback: Function) {
    persistence.save(kalender, callback);
  },

  getCurrentKalender: function getCurrentKalender(
    aDatumUhrzeit: DatumUhrzeit,
    callback: Function
  ) {
    this.getKalender(
      aDatumUhrzeit.vorigerOderAktuellerUngeraderMonat.fuerKalenderViews,
      callback
    );
  },

  getNextKalender: function getNextKalender(
    aDatumUhrzeit: DatumUhrzeit,
    callback: Function
  ) {
    this.getKalender(
      aDatumUhrzeit.naechsterUngeraderMonat.fuerKalenderViews,
      callback
    );
  }
};
