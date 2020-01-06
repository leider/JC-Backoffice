/* eslint-disable @typescript-eslint/no-explicit-any */
import mongodb, { FilterQuery, FindOneOptions, MongoCallback, UpdateWriteOpResult } from "mongodb";
import { ErrorCallback } from "async";
import conf from "../commons/simpleConfigure";
import async from "async";
import { loggers } from "winston";
const logger = loggers.get("transactions");
const scriptLogger = loggers.get("scripts");

const DBSTATE = { OPEN: "OPEN", CLOSED: "CLOSED", OPENING: "OPENING" };
let ourDB: mongodb.Db | null;
let ourDBConnectionState = DBSTATE.CLOSED;

export default function(collectionName: string) {
  let logOpenOnceOnly = 0;
  function logInfo(logMessage: string): void {
    if (collectionName === "optionenstore") {
      scriptLogger.info(logMessage);
    }
  }

  function openDB(): void {
    if (ourDBConnectionState !== DBSTATE.CLOSED) {
      logInfo("connection state is " + ourDBConnectionState + ". Returning.");
      return;
    }

    logInfo("Setting connection state to OPENING");
    ourDBConnectionState = DBSTATE.OPENING;

    const MongoClient = mongodb.MongoClient;
    logInfo("Connecting to Mongo");
    MongoClient.connect(conf.get("mongoURL") as string, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
      const db = client.db("jazzclub");
      logInfo("In connect callback");
      if (err) {
        logInfo("An error occurred: " + err);
        ourDBConnectionState = DBSTATE.CLOSED;
        return logger.error(err);
      }
      ourDB = db;
      ourDBConnectionState = DBSTATE.OPEN;
      return logInfo("DB state is now OPEN, db = " + db);
    });
  }

  function performInDB(callback: Function): void {
    if (ourDBConnectionState === DBSTATE.OPEN) {
      if (logOpenOnceOnly === 0) {
        logInfo("connection is open");
        logOpenOnceOnly++;
      }
      callback(null, ourDB);
    } else {
      logInfo("connection is " + ourDBConnectionState + ", opening it and retrying");
      openDB();
      setTimeout(function() {
        performInDB(callback);
      }, 100);
    }
  }

  class Persistence {
    private collectionName: string;

    constructor(collName: string) {
      this.collectionName = collName;
    }

    list(sortOrder: object, callback: Function): void {
      this.listByField({}, sortOrder, callback);
    }

    listByIds(list: string[], sortOrder: object, callback: Function): void {
      this.listByField({ id: { $in: list } }, sortOrder, callback);
    }

    listByField(searchObject: FilterQuery<any>, sortOrder: object, callback: Function): void {
      this.listByFieldWithOptions(searchObject, {}, sortOrder, callback);
    }

    listByFieldWithOptions(searchObject: FilterQuery<any>, options: FindOneOptions, sortOrder: object, callback: Function): void {
      performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        const cursor = db
          .collection(this.collectionName)
          .find(searchObject, options)
          .sort(sortOrder);
        return cursor.count((err1, result) => {
          if (err1) {
            return callback(err1);
          }
          if (!result) {
            // If not items found, return empty array
            return callback(null, []);
          }
          cursor.batchSize(result);
          return cursor.toArray(callback as MongoCallback<any>);
        });
      });
    }

    getById(id: string, callback: Function): void {
      this.getByField({ id }, callback);
    }

    getByField(fieldAsObject: FilterQuery<any>, callback: Function): void {
      performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        return db
          .collection(collectionName)
          .find(fieldAsObject)
          .toArray((err1, result) => {
            if (err1) {
              callback(err1);
            } else {
              callback(err1, result[0]);
            }
          });
      });
    }

    save(object: object & { id?: string }, callback: Function): void {
      this.update(object, object.id, callback);
    }

    update(object: object & { id?: string }, storedId: string | undefined, callback: Function): void {
      if (object.id === null || object.id === undefined) {
        return callback(new Error("Given object has no valid id"));
      }
      return performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        return collection.updateOne({ id: storedId }, { $set: object }, { upsert: true }, callback as MongoCallback<UpdateWriteOpResult>);
      });
    }

    removeByUrl(url: string, callback: Function): void {
      if (url === null || url === undefined) {
        return callback(new Error("Given object has no valid url"));
      }
      return performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        return collection.deleteOne({ url: url }, { w: 1 }, err1 => {
          callback(err1);
        });
      });
    }

    removeById(id: string, callback: Function): void {
      if (id === null || id === undefined) {
        return callback(new Error("Given object has no valid id"));
      }
      return performInDB((err: Error | null, db: mongodb.Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(collectionName);
        return collection.deleteOne({ id: id }, { w: 1 }, err1 => {
          callback(err1);
        });
      });
    }

    saveAll(objects: Array<object & { id?: string }>, outerCallback: Function): void {
      async.each(
        objects,
        (each, callback: ErrorCallback) => {
          this.save(each, callback);
        },
        outerCallback as ErrorCallback
      );
    }
  }

  openDB();
  return new Persistence(collectionName);
}
