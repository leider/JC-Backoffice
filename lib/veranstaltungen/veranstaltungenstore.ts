import R from 'ramda';

import misc from '../commons/misc';
import winston from 'winston';
const logger = winston.loggers.get('transactions');
import pers from '../persistence/persistence';
const persistence = pers('veranstaltungenstore');
import Veranstaltung from './object/veranstaltung';
import DatumUhrzeit from '../commons/DatumUhrzeit';

function toVeranstaltung(callback: Function, err: Error | null, jsobject: any) {
  return misc.toObject(Veranstaltung, callback, err, jsobject);
}

function toVeranstaltungenList(
  callback: Function,
  err: Error | null,
  jsobjects: any
) {
  return misc.toObjectList(Veranstaltung, callback, err, jsobjects);
}

function byDateRange(
  rangeFrom: DatumUhrzeit,
  rangeTo: DatumUhrzeit,
  sortOrder: any,
  callback: Function
) {
  persistence.listByField(
    {
      $and: [
        { endDate: { $gt: rangeFrom.toJSDate } },
        { startDate: { $lt: rangeTo.toJSDate } }
      ]
    },
    sortOrder,
    R.partial(toVeranstaltungenList, [callback])
  );
}

function byDateRangeInAscendingOrder(
  rangeFrom: DatumUhrzeit,
  rangeTo: DatumUhrzeit,
  callback: Function
) {
  byDateRange(rangeFrom, rangeTo, { startDate: 1 }, callback);
}

function byDateRangeInDescendingOrder(
  rangeFrom: DatumUhrzeit,
  rangeTo: DatumUhrzeit,
  callback: Function
) {
  byDateRange(rangeFrom, rangeTo, { startDate: -1 }, callback);
}

export default {
  zukuenftigeMitGestern: function zukuenftigeMitGestern(callback: Function) {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(
      now.minus({ tage: 1 }),
      now.plus({ jahre: 10 }),
      callback
    );
  },

  zukuenftige: function zukuenftige(callback: Function) {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(now, now.plus({ jahre: 10 }), callback);
  },

  vergangene: function vergangene(callback: Function) {
    const now = new DatumUhrzeit();
    byDateRangeInDescendingOrder(now.minus({ jahre: 100 }), now, callback);
  },

  alle: function alle(callback: Function) {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(
      now.minus({ jahre: 20 }),
      now.plus({ jahre: 10 }),
      callback
    );
  },

  byDateRangeInAscendingOrder,

  getVeranstaltung: function getVeranstaltung(url: string, callback: Function) {
    persistence.getByField({ url }, R.partial(toVeranstaltung, [callback]));
  },

  getVeranstaltungForId: function getVeranstaltungForId(
    id: string,
    callback: Function
  ) {
    persistence.getById(id, R.partial(toVeranstaltung, [callback]));
  },

  saveVeranstaltung: function saveVeranstaltung(
    veranstaltung: Veranstaltung,
    callback: Function
  ) {
    // @ts-ignore
    persistence.save(veranstaltung.state, callback);
  },

  deleteVeranstaltung: function removeVeranstaltung(
    url: string,
    callback: Function
  ) {
    persistence.removeByUrl(url, (err: Error | null) => {
      logger.info('Veranstaltung removed:' + JSON.stringify(url));
      callback(err);
    });
  }
};
