/* eslint-disable @typescript-eslint/no-explicit-any */
import { Db, Filter, MongoClient, Sort } from "mongodb";
import conf from "../../../shared/commons/simpleConfigure.js";
import { loggers } from "winston";

const logger = loggers.get("transactions");
const scriptLogger = loggers.get("scripts");

const DBSTATE = { OPEN: "OPEN", CLOSED: "CLOSED", OPENING: "OPENING" };
let ourDB: Db;
let ourDBConnectionState = DBSTATE.CLOSED;

class Persistence {
  private collectionName: string;

  constructor(collName: string) {
    this.collectionName = collName;
  }

  async list(sortOrder: Sort) {
    return this.listByField({}, sortOrder);
  }

  async listByIds(list: string[], sortOrder: Sort) {
    return this.listByField({ id: { $in: list } }, sortOrder);
  }

  async listByField(searchObject: Filter<any>, sortOrder: Sort) {
    const db = await getOpenDb();
    return db.collection(this.collectionName).find(searchObject).sort(sortOrder).toArray();
  }

  async getById(id: string) {
    return this.getByField({ id });
  }

  async getByField(fieldAsObject: Filter<any>) {
    const db = await getOpenDb();
    const result = await db.collection(this.collectionName).find(fieldAsObject).toArray();
    return result[0];
  }

  async save(object: object & { id?: string }) {
    return this.update(object, object.id);
  }

  async update(object: object & { id?: string }, storedId?: string) {
    if (object.id === null || object.id === undefined) {
      throw new Error("Given object has no valid id");
    }

    const db = await getOpenDb();
    const collection = db.collection(this.collectionName);
    return collection.replaceOne({ id: storedId }, object, { upsert: true });
  }

  async removeWithQuery(query: object) {
    if (query === null || query === undefined) {
      throw new Error("Given object has no valid query");
    }
    const db = await getOpenDb();
    return db.collection(this.collectionName).deleteMany(query);
  }

  async removeById(id: string) {
    if (id === null || id === undefined) {
      throw new Error("Given object has no valid id");
    }
    const db = await getOpenDb();
    return db.collection(this.collectionName).deleteOne(
      { id },
      {
        writeConcern: { w: 1 },
      },
    );
  }

  async removeAllByIds(ids: string[]) {
    if (ids === null || ids === undefined) {
      throw new Error("Given object has no valid id");
    }
    if (ids.length === 0) {
      return { acknowledged: true, deletedCount: 0 };
    }
    const db = await getOpenDb();
    return db.collection(this.collectionName).deleteMany(
      { id: { $in: ids } },
      {
        writeConcern: { w: 1 },
      },
    );
  }

  saveAll(objects: Array<object & { id?: string }>) {
    return Promise.all(objects.map((obj) => this.save(obj)));
  }
}

let logOpenOnceOnly = 0;
function logInfo(logMessage: string): void {
  scriptLogger.info(logMessage);
}

async function openMongo() {
  if (ourDBConnectionState !== DBSTATE.CLOSED) {
    logInfo("connection state is " + ourDBConnectionState + ". Returning.");
    return;
  }

  logInfo("Setting connection state to OPENING");
  ourDBConnectionState = DBSTATE.OPENING;

  logInfo("Connecting to Mongo");
  try {
    logInfo("In connect Promise");
    const client = await MongoClient.connect(conf.get("mongoURL") as string);
    const db = client.db();
    ourDB = db;
    ourDBConnectionState = DBSTATE.OPEN;
    logInfo(`DB state is now OPEN, db = ${conf.get("mongoURL")}`);
  } catch (err) {
    logInfo("An error occurred: " + err);
    ourDBConnectionState = DBSTATE.CLOSED;
    logger.error(err);
  }
}

async function getOpenDb(): Promise<Db> {
  if (ourDBConnectionState === DBSTATE.OPEN) {
    if (logOpenOnceOnly === 0) {
      logInfo("connection is open");
      logOpenOnceOnly++;
    }
    return ourDB;
  }
  logInfo("connection is " + ourDBConnectionState + ", opening it and retrying");
  await openMongo();
  await new Promise((resolve) => setTimeout(resolve, 100));
  return getOpenDb();
}

openMongo();

export default function (collectionName: string): Persistence {
  return new Persistence(collectionName);
}
