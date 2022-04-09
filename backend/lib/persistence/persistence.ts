/* eslint-disable @typescript-eslint/no-explicit-any */
import { Callback, Db, Filter, MongoClient, Sort, UpdateResult } from "mongodb";
import async, { ErrorCallback } from "async";
import conf from "../commons/simpleConfigure";
import { loggers } from "winston";

const logger = loggers.get("transactions");
const scriptLogger = loggers.get("scripts");

const DBSTATE = { OPEN: "OPEN", CLOSED: "CLOSED", OPENING: "OPENING" };
let ourDB: Db | null;
let ourDBConnectionState = DBSTATE.CLOSED;

class Persistence {
  private collectionName: string;

  constructor(collName: string) {
    this.collectionName = collName;
  }

  list(sortOrder: Sort, callback: Function): void {
    this.listByField({}, sortOrder, callback);
  }

  listByIds(list: string[], sortOrder: Sort, callback: Function): void {
    this.listByField({ id: { $in: list } }, sortOrder, callback);
  }

  listByField(searchObject: Filter<any>, sortOrder: Sort, callback: Function): void {
    performInDB((err: Error | null, db: Db) => {
      if (err) {
        return callback(err);
      }
      const cursor = db.collection(this.collectionName).find(searchObject, {}).sort(sortOrder);
      return cursor.count((err1, result) => {
        if (err1) {
          return callback(err1);
        }
        if (!result) {
          // If not items found, return empty array
          return callback(null, []);
        }
        cursor.batchSize(result);
        return cursor.toArray(callback as Callback<any>);
      });
    });
  }
  getById(id: string, callback: Function): void {
    this.getByField({ id }, callback);
  }

  getByField(fieldAsObject: Filter<any>, callback: Function): void {
    performInDB((err: Error | null, db: Db) => {
      if (err) {
        return callback(err);
      }
      return db
        .collection(this.collectionName)
        .find(fieldAsObject)
        .toArray((err1, result) => {
          callback(err1, result && result[0]);
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
    this.getById(object.id, (err: Error | null, oldObject: any) => {
      if (err) {
        return callback(err);
      }
      logger.info(`about to update ${this.collectionName} old: ${JSON.stringify(oldObject)}`);
      logger.info(`new: ${JSON.stringify(object)}`);
      return performInDB((err: Error | null, db: Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(this.collectionName);
        return collection.updateOne({ id: storedId }, { $set: object }, { upsert: true }, callback as Callback<UpdateResult>);
      });
    });
  }

  removeByUrl(url: string, callback: Function): void {
    if (url === null || url === undefined) {
      return callback(new Error("Given object has no valid url"));
    }
    this.getByField({ url }, (err: Error | null, oldObject: any) => {
      if (err) {
        return callback(err);
      }
      logger.info(`about to delete ${this.collectionName} object`);
      logger.info(JSON.stringify(oldObject));

      return performInDB((err: Error | null, db: Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(this.collectionName);
        return collection.deleteOne({ url: url }, (err1) => {
          callback(err1);
        });
      });
    });
  }

  removeById(id: string, callback: Function): void {
    if (id === null || id === undefined) {
      return callback(new Error("Given object has no valid id"));
    }
    this.getById(id, (err: Error | null, oldObject: any) => {
      if (err) {
        return callback(err);
      }
      logger.info(`about to delete ${this.collectionName} object`);
      logger.info(JSON.stringify(oldObject));

      return performInDB((err: Error | null, db: Db) => {
        if (err) {
          return callback(err);
        }
        const collection = db.collection(this.collectionName);
        return collection.deleteOne({ id: id }, (err1) => {
          callback(err1);
        });
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

let logOpenOnceOnly = 0;
function logInfo(logMessage: string): void {
  scriptLogger.info(logMessage);
}

function openDB(): void {
  if (ourDBConnectionState !== DBSTATE.CLOSED) {
    logInfo("connection state is " + ourDBConnectionState + ". Returning.");
    return;
  }

  logInfo("Setting connection state to OPENING");
  ourDBConnectionState = DBSTATE.OPENING;

  const client = new MongoClient(conf.get("mongoURL") as string);
  logInfo("Connecting to Mongo");
  client.connect((err, client) => {
    logInfo("In connect callback");
    if (err || !client) {
      logInfo("An error occurred: " + err);
      ourDBConnectionState = DBSTATE.CLOSED;
      return logger.error(err);
    }
    const db = client.db("jazzclub");
    ourDB = db;
    ourDBConnectionState = DBSTATE.OPEN;
    return logInfo("DB state is now OPEN, db = " + JSON.stringify(db.databaseName));
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
    setTimeout(function () {
      performInDB(callback);
    }, 100);
  }
}

openDB();

export default function (collectionName: string): Persistence {
  return new Persistence(collectionName);
}
