/*global emit */

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
  allActivities: function allActivities(callback) {
    persistence.list({startDate: 1}, R.partial(toVeranstaltungenList, [callback]));
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

  removeVeranstaltung: function removeVeranstaltung(veranstaltung, callback) {
    persistence.remove(veranstaltung.id(), err => {
      logger.info('Veranstaltung removed:' + JSON.stringify(veranstaltung));
      callback(err);
    });
  },

  upcomingActivitiesForGroupIds: function upcomingActivitiesForGroupIds(groupIds, callback) {
    const start = moment().unix();

    persistence.listByField({
      $and: [
        {endUnix: {$gt: start}},
        {assignedGroup: {$in: groupIds}}
      ]
    }, {startDate: 1}, R.partial(toVeranstaltungenList, [callback]));
  },

  activitiesForGroupIdsAndRegisteredMemberId: function activitiesForGroupIdsAndRegisteredMemberId(groupIds, memberId, upcoming, callback) {
    function map() {
      /* eslint no-underscore-dangle: 0 */
      const veranstaltung = this; // "this" holds the veranstaltung that is currently being examined

      // is the assigned group in the list of groups?
      if (groupIds.indexOf(veranstaltung.assignedGroup) > -1) {
        emit(memberId, veranstaltung);
      } else { // only try this if the first one failed -> otherwise we get duplicate entries!

        // is the member registered in one of the resources?
        for (var resource in veranstaltung.resources) {
          if (veranstaltung.resources.hasOwnProperty(resource) && veranstaltung.resources[resource]._registeredMembers) {
            const memberIsRegistered = veranstaltung.resources[resource]._registeredMembers.some(
              function (mem) { return mem.memberId === memberId; }
            );
            if (memberIsRegistered) {
              emit(memberId, veranstaltung);
              return;
            } // we only want to add the veranstaltung once
          }
        }
      }
    }

    function reduce(key, values) {
      return values;
    }

    const now = moment().unix();
    const query = upcoming ? {endUnix: {$gt: now}} : {endUnix: {$lt: now}};
    const parameters = {out: {inline: 1}, scope: {memberId, groupIds}, query, jsMode: true};

    persistence.mapReduce(map, reduce, parameters, (err, collection) => {
      if (err && err.errmsg === 'ns doesn\'t exist') { return callback(null, []); } // no mongostore available -> nevermind
      if (err) { return callback(err); }
      if (!collection || collection.length === 0) {
        return callback(null, []);
      }
      // when there are many results, the value will be a nested array, so we need to flatten it:
      const results = flattenAndSortMongoResultCollection(collection);
      return toVeranstaltungenList(callback, null, !upcoming ? results.reverse() : results);
    });
  },

  flattenAndSortMongoResultCollection
};
