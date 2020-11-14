import DatumUhrzeit from "../commons/DatumUhrzeit";

import partial from "lodash/partial";
import Termin from "./termin";
import misc from "../commons/misc";

import pers from "../persistence/persistence";
const persistence = pers("terminstore");

function toTermin(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(Termin, callback, err, jsobject);
}

function toTerminList(callback: Function, err: Error | null, jsobjects: object[]): void {
  return misc.toObjectList(Termin, callback, err, jsobjects);
}

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: object, callback: Function): void {
  // ranges are DatumUhrzeit
  persistence.listByField(
    {
      $and: [{ endDate: { $gt: rangeFrom.toJSDate } }, { startDate: { $lt: rangeTo.toJSDate } }],
    },
    sortOrder,
    partial(toTerminList, callback)
  );
}

export default {
  alle: function alle(callback: Function): void {
    persistence.list({ startDate: -1 }, partial(toTerminList, callback));
  },

  save: function save(termin: Termin, callback: Function): void {
    persistence.save(termin.toJSON(), callback);
  },

  termineBetween: function termineBetween(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, callback: Function): void {
    byDateRange(rangeFrom, rangeTo, { startDate: 1 }, callback);
  },

  remove: function remove(id: string, callback: Function): void {
    persistence.removeById(id, callback);
  },
};
