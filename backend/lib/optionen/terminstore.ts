import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Termin from "jc-shared/optionen/termin";

import pers from "../persistence/persistenceNew";
import { Sort } from "mongodb";

const persistence = pers("terminstore");

async function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: Sort) {
  // ranges are DatumUhrzeit
  const result = await persistence.listByField(
    {
      $and: [{ endDate: { $gt: rangeFrom.toJSDate } }, { startDate: { $lt: rangeTo.toJSDate } }],
    },
    sortOrder
  );
  return result.map((each) => new Termin(each));
}

export default {
  alle: async function alle() {
    const result = await persistence.list({ startDate: -1 });
    return result.map((each) => new Termin(each));
  },

  save: async function save(termin: Termin) {
    return persistence.save(termin.toJSON());
  },

  termineBetween: async function termineBetween(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
    return byDateRange(rangeFrom, rangeTo, { startDate: 1 });
  },

  remove: async function remove(id: string) {
    return persistence.removeById(id);
  },
};
