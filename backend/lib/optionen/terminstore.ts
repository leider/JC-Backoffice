import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Termin from "jc-shared/optionen/termin.js";

import pers from "../persistence/persistence.js";
import { Sort } from "mongodb";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("terminstore");

async function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: Sort) {
  // ranges are DatumUhrzeit
  const result = await persistence.listByField(
    {
      $and: [{ endDate: { $gt: rangeFrom.toJSDate } }, { startDate: { $lt: rangeTo.toJSDate } }],
    },
    sortOrder
  );
  return misc.toObjectList(Termin, result);
}

export default {
  alle: async function alle() {
    const result = await persistence.list({ startDate: -1 });
    return misc.toObjectList(Termin, result);
  },

  save: async function save(termin: Termin) {
    await persistence.save(termin.toJSON());
    return termin;
  },

  termineBetween: async function termineBetween(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
    return byDateRange(rangeFrom, rangeTo, { startDate: 1 });
  },

  remove: async function remove(id: string) {
    return persistence.removeById(id);
  },
};
