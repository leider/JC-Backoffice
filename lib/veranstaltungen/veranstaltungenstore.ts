import R from "ramda";

import misc from "../commons/misc";
import winston from "winston";
const logger = winston.loggers.get("transactions");
import pers from "../persistence/persistence";
const persistence = pers("veranstaltungenstore");
import Veranstaltung from "./object/veranstaltung";
import DatumUhrzeit from "../commons/DatumUhrzeit";

function toVeranstaltung(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject2(Veranstaltung, callback, err, jsobject);
}

function toVeranstaltungenList(callback: Function, err: Error | null, jsobjects: object[]): void {
  return misc.toObjectList2(Veranstaltung, callback, err, jsobjects);
}

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: object, callback: Function): void {
  persistence.listByField(
    {
      $and: [{ endDate: { $gt: rangeFrom.toJSDate } }, { startDate: { $lt: rangeTo.toJSDate } }]
    },
    sortOrder,
    R.partial(toVeranstaltungenList, [callback])
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
    byDateRangeInDescendingOrder(now.minus({ jahre: 100 }), now, callback);
  },

  alle: function alle(callback: Function): void {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(now.minus({ jahre: 20 }), now.plus({ jahre: 10 }), callback);
  },

  byDateRangeInAscendingOrder,

  getVeranstaltung: function getVeranstaltung(url: string, callback: Function): void {
    persistence.getByField({ url }, R.partial(toVeranstaltung, [callback]));
  },

  getVeranstaltungForId: function getVeranstaltungForId(id: string, callback: Function): void {
    persistence.getById(id, R.partial(toVeranstaltung, [callback]));
  },

  saveVeranstaltung: function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
    persistence.save(veranstaltung.toJSON(), callback);
  },

  deleteVeranstaltung: function removeVeranstaltung(url: string, callback: Function): void {
    persistence.removeByUrl(url, (err: Error | null) => {
      logger.info("Veranstaltung removed:" + JSON.stringify(url));
      callback(err);
    });
  }
};
