const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const moment = require('moment-timezone');

const logger = require('winston').loggers.get('transactions');
const persistence = beans.get('veranstaltungenPersistence');
const Veranstaltung = beans.get('veranstaltung');

function toVeranstaltung(callback, err, jsobject) {
  return misc.toObject(Veranstaltung, callback, err, jsobject);
}

function toVeranstaltungenList(callback, err, jsobjects) {
  if (err) { return callback(err); }
  callback(null, jsobjects.map(record => new Veranstaltung(record)));
}

function byDateRange(rangeFrom, rangeTo, sortOrder, callback) {
  // ranges are moments
  persistence.listByField({
    $and: [
      {endDate: {$gt: rangeFrom.toDate()}},
      {startDate: {$lt: rangeTo.toDate()}}
    ]
  }, sortOrder, R.partial(toVeranstaltungenList, [callback]));
}

function byDateRangeInAscendingOrder(rangeFrom, rangeTo, callback) {
  byDateRange(rangeFrom, rangeTo, {startDate: 1}, callback);
}

function byDateRangeInDescendingOrder(rangeFrom, rangeTo, callback) {
  byDateRange(rangeFrom, rangeTo, {startDate: -1}, callback);
}

function flattenAndSortMongoResultCollection(collection) {
  return R.sortBy(R.prop('startDate'), R.flatten(collection[0].value));
}

module.exports = {
  zukuenftige: function zukuenftige(callback) {
    const start = moment();
    const end = moment().add(10, 'years');
    byDateRangeInAscendingOrder(start, end, callback);
  },

  vergangene: function vergangene(callback) {
    const start = moment().add(-20, 'years');
    const end = moment();
    byDateRangeInDescendingOrder(start, end, callback);
  },

  byDateRangeInAscendingOrder,

  byDateRangeInDescendingOrder,

  getVeranstaltung: function getVeranstaltung(url, callback) {
    persistence.getByField({url}, R.partial(toVeranstaltung, [callback]));
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
  },

  flattenAndSortMongoResultCollection
};
