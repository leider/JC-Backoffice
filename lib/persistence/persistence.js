const conf = require('simple-configure');
const async = require('async');
let ourDB;
const loggers = require('winston').loggers;
const logger = loggers.get('transactions');
const scriptLogger = loggers.get('scripts');

const DBSTATE = { OPEN: 'OPEN', CLOSED: 'CLOSED', OPENING: 'OPENING' };
let ourDBConnectionState = DBSTATE.CLOSED;

// prettier-ignore
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
    logInfo(
      'connection is ' + ourDBConnectionState + ', opening it and retrying'
    );
    persistence.openDB();
    setTimeout(function() {
      performInDB(callback);
    }, 100);
  }

  persistence = {
    list: function list(sortOrder, callback) {
      this.listByField({}, sortOrder, callback);
    },

    listByIds: function listByIds(list, sortOrder, callback) {
      this.listByField({ id: { $in: list } }, sortOrder, callback);
    },

    listByField: function listByField(searchObject, sortOrder, callback) {
      this.listByFieldWithOptions(searchObject, {}, sortOrder, callback);
    },

    listByFieldWithOptions: function listByFieldWithOptions(
      searchObject,
      options,
      sortOrder,
      callback
    ) {
      performInDB((err, db) => {
        if (err) {
          return callback(err);
        }
        const cursor = db
          .collection(collectionName)
          .find(searchObject, options)
          .sort(sortOrder);
        cursor.count((err1, result) => {
          if (err1) {
            return callback(err1);
          }
          if (!result) {
            // If not items found, return empty array
            return callback(null, []);
          }
          cursor.batchSize(result);
          cursor.toArray((err2, result1) => {
            if (err2) {
              return callback(err2);
            }
            callback(null, result1);
          });
        });
      });
    },

    getById: function getById(id, callback) {
      this.getByField({ id }, callback);
    },

    getByField: function getByField(fieldAsObject, callback) {
      performInDB((err, db) => {
        if (err) {
          return callback(err);
        }
        db.collection(collectionName)
          .find(fieldAsObject)
          .toArray((err1, result) => {
            if (err1) {
              return callback(err1);
            }
            callback(err1, result[0]);
          });
      });
    },

    mapReduce: function mapReduce(map, reduce, options, callback) {
      performInDB((err, db) => {
        if (err) {
          return callback(err);
        }
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
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        collection.updateOne(
          { id: storedId },
          { $set: object },
          { upsert: true },
          err1 => {
            if (err1) {
              return callback(err1);
            }
            //logger.info(object.constructor.name + ' saved: ' + JSON.stringify(object));
            callback(null);
          }
        );
      });
    },

    removeByUrl: function removeByUrl(url, callback) {
      if (url === null || url === undefined) {
        return callback(new Error('Given object has no valid url'));
      }
      performInDB((err, db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        collection.remove({ url: url }, { w: 1 }, err1 => {
          callback(err1);
        });
      });
    },

    removeById: function removeById(id, callback) {
      if (id === null || id === undefined) {
        return callback(new Error('Given object has no valid id'));
      }
      performInDB((err, db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        collection.remove({ id: id }, { w: 1 }, err1 => {
          callback(err1);
        });
      });
    },

    saveAll: function saveAll(objects, outerCallback) {
      async.each(
        objects,
        (each, callback) => {
          this.save(each, callback);
        },
        outerCallback
      );
    },

    drop: function drop(callback) {
      performInDB((err, db) => {
        if (err) {
          return callback(err);
        }
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
      MongoClient.connect(
        conf.get('mongoURL'),
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
          var db = client.db('jazzclub');
          logInfo('In connect callback');
          if (err) {
            logInfo('An error occurred: ' + err);
            ourDBConnectionState = DBSTATE.CLOSED;
            return logger.error(err);
          }
          ourDB = db;
          ourDBConnectionState = DBSTATE.OPEN;
          logInfo('DB state is now OPEN, db = ' + db);
        }
      );
    },

    closeDB: function closeDB(callback) {
      if (ourDBConnectionState === DBSTATE.CLOSED) {
        if (callback) {
          callback();
        }
        return;
      }
      performInDB(() => {
        ourDB.unref();
        ourDB = undefined;
        ourDBConnectionState = DBSTATE.CLOSED;
        logInfo('connection closed');
        if (callback) {
          callback();
        }
      });
    }
  };

  persistence.openDB();
  return persistence;
};
