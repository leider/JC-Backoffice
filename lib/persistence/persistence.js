const conf = require('simple-configure');
const async = require('async');
let ourDB;
const loggers = require('winston').loggers;
const logger = loggers.get('transactions');
const scriptLogger = loggers.get('scripts');

const DBSTATE = {OPEN: 'OPEN', CLOSED: 'CLOSED', OPENING: 'OPENING'};
let ourDBConnectionState = DBSTATE.CLOSED;

module.exports = function (collectionName) {
  let persistence;

  function logInfo(logMessage) {
    if (collectionName === 'settingsstore') {
      scriptLogger.info(logMessage);
    }
  }

  function performInDB(callback) {
    if (ourDBConnectionState === DBSTATE.OPEN) {
      logInfo('connection is open');
      return callback(null, ourDB);
    }
    logInfo('connection is ' + ourDBConnectionState + ', opening it and retrying');
    persistence.openDB();
    setTimeout(function () {
      performInDB(callback);
    }, 100);
  }

  persistence = {
    list: function list(sortOrder, callback) {
      this.listByField({}, sortOrder, callback);
    },

    listByIds: function listByIds(list, sortOrder, callback) {
      this.listByField({'id': {$in: list}}, sortOrder, callback);
    },

    listByField: function listByField(searchObject, sortOrder, callback) {
      this.listByFieldWithOptions(searchObject, {}, sortOrder, callback);
    },

    listByFieldWithOptions: function listByFieldWithOptions(searchObject, options, sortOrder, callback) {
      performInDB((err, db) => {
        if (err) { return callback(err); }
        const cursor = db.collection(collectionName).find(searchObject, options).sort(sortOrder);
        cursor.count((err1, result) => {
          if (err1) { return callback(err1); }
          if (!result) {
            // If not items found, return empty array
            return callback(null, []);
          }
          cursor.batchSize(result);
          cursor.toArray((err2, result1) => {
            if (err2) { return callback(err2); }
            callback(null, result1);
          });
        });
      });
    },

    getById: function getById(id, callback) {
      this.getByField({id}, callback);
    },

    getByField: function getByField(fieldAsObject, callback) {
      performInDB((err, db) => {
        if (err) { return callback(err); }
        db.collection(collectionName).find(fieldAsObject).toArray((err1, result) => {
          if (err1) { return callback(err1); }
          callback(err1, result[0]);
        });
      });
    },

    mapReduce: function mapReduce(map, reduce, options, callback) {
      performInDB((err, db) => {
        if (err) { return callback(err); }
        db.collection(collectionName).mapReduce(map, reduce, options, callback);
      });
    },

    save: function save(object, callback) {
      this.update(object, object.id, callback);
    },

    update: function update(object, storedId, callback) {
      if (object.id === null || object.id === undefined) {
        return callback(new Error('Given object has no valid id'));
      }
      performInDB((err, db) => {
        if (err) { return callback(err); }
        const collection = db.collection(collectionName);
        collection.updateOne({id: storedId}, object, {upsert: true}, err1 => {
          if (err1) { return callback(err1); }
          //logger.info(object.constructor.name + ' saved: ' + JSON.stringify(object));
          callback(null);
        });
      });
    },

    remove: function remove(objectId, callback) {
      if (objectId === null || objectId === undefined) {
        return callback(new Error('Given object has no valid id'));
      }
      performInDB((err, db) => {
        if (err) { return callback(err); }
        const collection = db.collection(collectionName);
        collection.remove({id: objectId}, {w: 1}, err1 => {
          callback(err1);
        });
      });
    },

    saveAll: function saveAll(objects, outerCallback) {
      const self = this;
      async.each(objects, (each, callback) => { self.save(each, callback); }, outerCallback);
    },

    drop: function drop(callback) {
      performInDB((err, db) => {
        if (err) { return callback(err); }
        logger.info('Drop ' + collectionName + ' called!');
        db.dropCollection(collectionName, err1 => {
          callback(err1);
        });
      });
    },

    openDB: function openDB() {
      if (ourDBConnectionState !== DBSTATE.CLOSED) {
        logInfo('connection state is ' + ourDBConnectionState + '. Returning.');
        return;
      }

      logInfo('Setting connection state to OPENING');
      ourDBConnectionState = DBSTATE.OPENING;

      const MongoClient = require('mongodb').MongoClient;
      logInfo('Connecting to Mongo');
      MongoClient.connect(conf.get('mongoURL'), (err, db) => {
        logInfo('In connect callback');
        if (err) {
          logInfo('An error occurred: ' + err);
          ourDBConnectionState = DBSTATE.CLOSED;
          return logger.error(err);
        }
        ourDB = db;
        ourDBConnectionState = DBSTATE.OPEN;
        logInfo('DB state is now OPEN, db = ' + db);
      });
    },

    closeDB: function closeDB(callback) {
      if (ourDBConnectionState === DBSTATE.CLOSED) {
        if (callback) { callback(); }
        return;
      }
      performInDB(() => {
        ourDB.close();
        ourDB = undefined;
        ourDBConnectionState = DBSTATE.CLOSED;
        logInfo('connection closed');
        if (callback) { callback(); }
      });
    }
  };

  persistence.openDB();
  return persistence;
};
