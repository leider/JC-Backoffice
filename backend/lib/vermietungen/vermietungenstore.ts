import winston from "winston";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import pers from "../persistence/persistence.js";
import { Sort } from "mongodb";
import misc from "jc-shared/commons/misc.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";

const persistence = pers("vermietungenstore");
const logger = winston.loggers.get("transactions");

async function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: Sort) {
  const result = await persistence.listByField(
    {
      $and: [{ endDate: { $gt: rangeFrom.toJSDate } }, { startDate: { $lt: rangeTo.toJSDate } }],
    },
    sortOrder,
  );
  return misc.toObjectList(Vermietung, result);
}

async function byDateRangeInAscendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
  return byDateRange(rangeFrom, rangeTo, { startDate: 1 });
}

async function byDateRangeInDescendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
  return byDateRange(rangeFrom, rangeTo, { startDate: -1 });
}

export default {
  zukuenftigeMitGestern: async function zukuenftigeMitGestern() {
    const now = new DatumUhrzeit();
    return byDateRangeInAscendingOrder(now.minus({ tage: 1 }), now.plus({ jahre: 10 }));
  },

  zukuenftige: async function zukuenftige() {
    const now = new DatumUhrzeit();
    return byDateRangeInAscendingOrder(now, now.plus({ jahre: 10 }));
  },

  vergangene: async function vergangene() {
    const now = new DatumUhrzeit();
    return byDateRangeInDescendingOrder(now.minus({ monate: 12 }), now);
  },

  alle: async function alle() {
    const now = new DatumUhrzeit();
    return byDateRangeInDescendingOrder(now.minus({ jahre: 20 }), now.plus({ jahre: 10 }));
  },

  byDateRangeInAscendingOrder,

  getVermietung: async function getVermietung(url: string) {
    const result = await persistence.getByField({ url });
    return misc.toObject(Vermietung, result);
  },

  getVermietungForId: async function getVermietungForId(id: string) {
    const result = await persistence.getById(id);
    return misc.toObject(Vermietung, result);
  },

  saveVermietung: async function saveVermietung(vermietung: Vermietung) {
    const object = vermietung.toJSON();
    await persistence.save(object);
    return vermietung;
  },

  deleteVermietungById: async function deleteVermietungById(id: string) {
    await persistence.removeById(id);
    logger.info(`Vermietung removed: ${JSON.stringify(id)}`);
    return;
  },
};
