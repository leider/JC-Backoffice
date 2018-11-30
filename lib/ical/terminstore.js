const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const persistence = beans.get('terminPersistence');
const Termin = beans.get('termin');

function toTermin(callback, err, jsobject) {
  return misc.toObject(Termin, callback, err, jsobject);
}

function toTerminList(callback, err, jsobjects) {
  if (err) { return callback(err); }
  callback(null, jsobjects.map(record => new Termin(record)));
}

function byDateRange(rangeFrom, rangeTo, sortOrder, callback) {
  // ranges are moments
  persistence.listByField({
    $and: [
      {endDate: {$gt: rangeFrom.toDate()}},
      {startDate: {$lt: rangeTo.toDate()}}
    ]
  }, sortOrder, R.partial(toTerminList, [callback]));
}

module.exports = {
  forId: function forId(id, callback) {
    persistence.getById(id, R.partial(toTermin, [callback]));
  },

  alle: function alle(callback) {
    persistence.list({startDate: -1}, R.partial(toTerminList, [callback]));
  },

  save: function save(termin, callback) {
    persistence.save(termin.state, callback);
  },

  termineBetween: function termineBetween(rangeFrom, rangeTo, callback) {
    byDateRange(rangeFrom, rangeTo, {startDate: 1}, callback);
  },

  remove: function remove(id, callback) {
    persistence.removeById(id, callback);
  }
};
