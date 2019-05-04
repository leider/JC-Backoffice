const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');

const logger = require('winston').loggers.get('transactions');
const persistence = beans.get('veranstaltungenPersistence');
const Veranstaltung = beans.get('veranstaltung');
const DatumUhrzeit = beans.get('DatumUhrzeit');

function toVeranstaltung(callback, err, jsobject) {
  return misc.toObject(Veranstaltung, callback, err, jsobject);
}

function toVeranstaltungenList(callback, err, jsobjects) {
  if (err) {
    return callback(err);
  }
  callback(null, jsobjects.map(record => new Veranstaltung(record)));
}

function byDateRange(rangeFrom, rangeTo, sortOrder, callback) {
  // ranges are DatumUhrzeit
  persistence.listByField(
    {
      $and: [
        { endDate: { $gt: rangeFrom.toJSDate() } },
        { startDate: { $lt: rangeTo.toJSDate() } }
      ]
    },
    sortOrder,
    R.partial(toVeranstaltungenList, [callback])
  );
}

function byDateRangeInAscendingOrder(rangeFrom, rangeTo, callback) {
  byDateRange(rangeFrom, rangeTo, { startDate: 1 }, callback);
}

function byDateRangeInDescendingOrder(rangeFrom, rangeTo, callback) {
  byDateRange(rangeFrom, rangeTo, { startDate: -1 }, callback);
}

module.exports = {
  zukuenftigeMitGestern: function zukuenftigeMitGestern(callback) {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(
      now.minus({ tage: 1 }),
      now.plus({ jahre: 10 }),
      callback
    );
  },

  zukuenftige: function zukuenftige(callback) {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(now, now.plus({ jahre: 10 }), callback);
  },

  vergangene: function vergangene(callback) {
    const now = new DatumUhrzeit();
    byDateRangeInDescendingOrder(now.minus({ jahre: 20 }), now, callback);
  },

  alle: function alle(callback) {
    const now = new DatumUhrzeit();
    byDateRangeInAscendingOrder(
      now.minus({ jahre: 20 }),
      now.plus({ jahre: 10 }),
      callback
    );
  },

  byDateRangeInAscendingOrder,

  getVeranstaltung: function getVeranstaltung(url, callback) {
    persistence.getByField({ url }, R.partial(toVeranstaltung, [callback]));
  },

  getVeranstaltungForId: function getVeranstaltungForId(id, callback) {
    persistence.getById(id, R.partial(toVeranstaltung, [callback]));
  },

  saveVeranstaltung: function saveVeranstaltung(veranstaltung, callback) {
    persistence.save(veranstaltung.state, callback);
  },

  deleteVeranstaltung: function removeVeranstaltung(url, callback) {
    persistence.removeByUrl(url, err => {
      logger.info('Veranstaltung removed:' + JSON.stringify(url));
      callback(err);
    });
  }
};
