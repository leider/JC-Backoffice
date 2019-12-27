import DatumUhrzeit from '../commons/DatumUhrzeit';

import ramda from 'ramda';
import Termin from './termin';
import misc from '../commons/misc';

import pers from '../persistence/persistence';
const persistence = pers('terminstore');

function toTermin(callback: Function, err: Error | null, jsobject: any) {
  return misc.toObject(Termin, callback, err, jsobject);
}

function toTerminList(callback: Function, err: Error | null, jsobjects: any) {
  return misc.toObjectList(Termin, callback, err, jsobjects);
}

function byDateRange(
  rangeFrom: DatumUhrzeit,
  rangeTo: DatumUhrzeit,
  sortOrder: any,
  callback: Function
) {
  // ranges are DatumUhrzeit
  persistence.listByField(
    {
      $and: [
        { endDate: { $gt: rangeFrom.toJSDate } },
        { startDate: { $lt: rangeTo.toJSDate } }
      ]
    },
    sortOrder,
    ramda.partial(toTerminList, [callback])
  );
}

export default {
  forId: function forId(id: string, callback: Function) {
    persistence.getById(id, ramda.partial(toTermin, [callback]));
  },

  alle: function alle(callback: Function) {
    persistence.list(
      { startDate: -1 },
      ramda.partial(toTerminList, [callback])
    );
  },

  save: function save(termin: Termin, callback: Function) {
    persistence.save(termin.state, callback);
  },

  termineBetween: function termineBetween(
    rangeFrom: DatumUhrzeit,
    rangeTo: DatumUhrzeit,
    callback: Function
  ) {
    byDateRange(rangeFrom, rangeTo, { startDate: 1 }, callback);
  },

  remove: function remove(id: string, callback: Function) {
    persistence.removeById(id, callback);
  }
};
