import winston from "winston";

import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";

import pers from "../persistence/persistence";
import { Sort } from "mongodb";
const persistence = pers("veranstaltungenstore");
const logger = winston.loggers.get("transactions");

async function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: Sort) {
  const result = await persistence.listByField(
    {
      $and: [{ endDate: { $gt: rangeFrom.toJSDate } }, { startDate: { $lt: rangeTo.toJSDate } }],
    },
    sortOrder
  );
  return result.map((each) => new Veranstaltung(each));
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

  getVeranstaltung: async function getVeranstaltung(url: string) {
    const result = await persistence.getByField({ url });
    return result ? new Veranstaltung(result) : result;
  },

  getVeranstaltungForId: async function getVeranstaltungForId(id: string) {
    const result = await persistence.getById(id);
    return result ? new Veranstaltung(result) : result;
  },

  saveVeranstaltung: async function saveVeranstaltung(veranstaltung: Veranstaltung) {
    const object = veranstaltung.toJSON();
    await persistence.save(object);
    return veranstaltung;
  },

  deleteVeranstaltungById: async function deleteVeranstaltungById(id: string) {
    await persistence.removeById(id);
    logger.info(`Veranstaltung removed: ${JSON.stringify(id)}`);
    return;
  },
};
