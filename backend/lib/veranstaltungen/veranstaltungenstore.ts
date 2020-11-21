import partial from "lodash/partial";

import misc from "../../../shared/commons/misc";
import winston from "winston";
import pers from "../persistence/persistence";
import Veranstaltung from "../../../shared/veranstaltung//veranstaltung";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";

const logger = winston.loggers.get("transactions");
const persistence = pers("veranstaltungenstore");

function toVeranstaltung(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(Veranstaltung, callback, err, jsobject);
}

function toVeranstaltungenList(callback: Function, err: Error | null, jsobjects: object[]): void {
  return misc.toObjectList(Veranstaltung, callback, err, jsobjects);
}

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: object, callback: Function): void {
  persistence.listByField(
    {
      $and: [{ endDate: { $gt: rangeFrom.toJSDate } }, { startDate: { $lt: rangeTo.toJSDate } }],
    },
    sortOrder,
    partial(toVeranstaltungenList, callback)
  );
}

function byDateRangeInAscendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, callback: Function): void {
  byDateRange(rangeFrom, rangeTo, { startDate: 1 }, callback);
}

function byDateRangeInDescendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, callback: Function): void {
  byDateRange(rangeFrom, rangeTo, { startDate: -1 }, callback);
}

export default {
  zukuenftigeMitGestern: function zukuenftigeMitGestern(callback: Function): void {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(now.minus({ tage: 1 }), now.plus({ jahre: 10 }), callback);
  },

  zukuenftige: function zukuenftige(callback: Function): void {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(now, now.plus({ jahre: 10 }), callback);
  },

  vergangene: function vergangene(callback: Function): void {
    const now = new DatumUhrzeit();
    byDateRangeInDescendingOrder(now.minus({ monate: 12 }), now, callback);
  },

  alle: function alle(callback: Function): void {
    const now = new DatumUhrzeit();
    byDateRangeInDescendingOrder(now.minus({ jahre: 20 }), now.plus({ jahre: 10 }), callback);
  },

  byDateRangeInAscendingOrder,

  getVeranstaltung: function getVeranstaltung(url: string, callback: Function): void {
    persistence.getByField({ url }, partial(toVeranstaltung, callback));
  },

  getVeranstaltungForId: function getVeranstaltungForId(id: string, callback: Function): void {
    persistence.getById(id, partial(toVeranstaltung, callback));
  },

  saveVeranstaltung: function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
    const object = veranstaltung.toJSON();
    persistence.save(object, callback);
  },

  deleteVeranstaltung: function deleteVeranstaltung(url: string, callback: Function): void {
    persistence.removeByUrl(url, (err?: Error) => {
      logger.info(`Veranstaltung removed: ${JSON.stringify(url)}`);
      callback(err);
    });
  },

  deleteVeranstaltungById: function deleteVeranstaltungById(id: string, callback: Function): void {
    persistence.removeById(id, (err?: Error) => {
      logger.info(`Veranstaltung removed: ${JSON.stringify(id)}`);
      callback(err);
    });
  },
};
