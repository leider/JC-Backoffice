import partial from "lodash/partial";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Termin from "jc-shared/optionen/termin";
import misc from "jc-shared/commons/misc";

import pers from "../persistence/persistence";
import { Sort } from "mongodb";
const persistence = pers("terminstore");

function toTerminList(callback: Function, err: Error | null, jsobjects: object[]): void {
  return misc.toObjectList(Termin, callback, err, jsobjects);
}

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: Sort, callback: Function): void {
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
