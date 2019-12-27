import mongodb from 'mongodb';
import { ErrorCallback } from 'async';

const conf = require('simple-configure');
import async from 'async';
import { loggers } from 'winston';
const logger = loggers.get('transactions');
const scriptLogger = loggers.get('scripts');

const DBSTATE = { OPEN: 'OPEN', CLOSED: 'CLOSED', OPENING: 'OPENING' };
let ourDB: mongodb.Db | null;
let ourDBConnectionState = DBSTATE.CLOSED;

export default function(collectionName: string) {
  function logInfo(logMessage: string) {
    if (collectionName === 'optionenstore') {
      scriptLogger.info(logMessage);
    }
  }

  function performInDB(callback: Function) {
    if (ourDBConnectionState === DBSTATE.OPEN) {
      logInfo('connection is open');
      return callback(null, ourDB);
    }
    logInfo(
      'connection is ' + ourDBConnectionState + ', opening it and retrying'
    );
    openDB();
    setTimeout(function() {
      performInDB(callback);
    }, 100);
  }

  function openDB() {
    if (ourDBConnectionState !== DBSTATE.CLOSED) {
      logInfo('connection state is ' + ourDBConnectionState + '. Returning.');
      return;
    }

    logInfo('Setting connection state to OPENING');
    ourDBConnectionState = DBSTATE.OPENING;

    const MongoClient = mongodb.MongoClient;
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
  }

  function closeDB(callback: Function) {
    if (ourDBConnectionState === DBSTATE.CLOSED) {
      if (callback) {
        callback();
      }
      return;
    }
    performInDB(() => {
      ourDB = null;
      ourDBConnectionState = DBSTATE.CLOSED;
      logInfo('connection closed');
      if (callback) {
        callback();
      }
    });
  }

  class Persistence {
    private collectionName: string;

    constructor(collectionName: string) {
      this.collectionName = collectionName;
    }

    list(sortOrder: any, callback: Function) {
      this.listByField({}, sortOrder, callback);
    }

    listByIds(list: string[], sortOrder: any, callback: Function) {
      this.listByField({ id: { $in: list } }, sortOrder, callback);
    }

    listByField(searchObject: any, sortOrder: any, callback: Function) {
      this.listByFieldWithOptions(searchObject, {}, sortOrder, callback);
    }

    listByFieldWithOptions(
      searchObject: any,
      options: any,
      sortOrder: any,
      callback: Function
    ) {
      performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        const cursor = db
          .collection(this.collectionName)
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
    }

    getById(id: string, callback: Function) {
      this.getByField({ id }, callback);
    }

    getByField(fieldAsObject: any, callback: Function) {
      performInDB((err: Error | null, db: mongodb.Db) => {
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
    }

    save(object: any, callback: Function) {
      this.update(object, object.id, callback);
    }

    update(object: any, storedId: string, callback: Function) {
      if (object.id === null || object.id === undefined) {
        return callback(new Error('Given object has no valid id'));
      }
      performInDB((err: Error | null, db: mongodb.Db) => {
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
    }

    removeByUrl(url: string, callback: Function) {
      if (url === null || url === undefined) {
        return callback(new Error('Given object has no valid url'));
      }
      performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        collection.remove({ url: url }, { w: 1 }, err1 => {
          callback(err1);
        });
      });
    }

    removeById(id: string, callback: Function) {
      if (id === null || id === undefined) {
        return callback(new Error('Given object has no valid id'));
      }
      performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        collection.remove({ id: id }, { w: 1 }, err1 => {
          callback(err1);
        });
      });
    }

    saveAll(objects: Array<any>, outerCallback: Function) {
      async.each(
        objects,
        (each: any, callback: ErrorCallback) => {
          this.save(each, callback);
        },
        // @ts-ignore
        outerCallback
      );
    }

    drop(callback: Function) {
      performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        logger.info('Drop ' + collectionName + ' called!');
        db.dropCollection(collectionName, err1 => {
          callback(err1);
        });
      });
    }
  }

  openDB();
  return new Persistence(collectionName);
}
