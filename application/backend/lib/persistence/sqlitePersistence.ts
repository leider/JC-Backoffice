import Database, { SqliteError } from "better-sqlite3";
import conf from "jc-shared/commons/simpleConfigure.js";
import { loggers } from "winston";
import User from "jc-shared/user/user.js";
import { areDifferentForHistoryEntries } from "jc-shared/commons/comparingAndTransforming.js";

export const db = new Database(conf.sqlitedb);
const scriptLogger = loggers.get("scripts");
scriptLogger.info(`DB = ${conf.sqlitedb}`);

function asSqliteString(obj: object) {
  return `${escape(JSON.stringify(obj))}`;
}

export function escape(str = "") {
  return `'${str.replaceAll("'", "''")}'`;
}

export function execWithTry(command: string) {
  try {
    db.exec(command);
  } catch (e) {
    const errortext = (e as SqliteError).toString();
    if (!(errortext.startsWith("SqliteError: index") && errortext.endsWith("already exists"))) {
      // we expect re-entrance of index creation
      // eslint-disable-next-line no-console
      console.error(errortext);
    }
  }
}

process.on("SIGINT", () => {
  console.log("SHUTDOWN ON SIGINT (db)"); // eslint-disable-line no-console
  db.close();
});

class Persistence {
  private collectionName: string;
  private history: string;
  private extraCols: string[] = [];

  private initialize() {
    const columns = ["id TEXT PRIMARY KEY", "data BLOB"].concat(this.extraCols.map((col) => `${col} TEXT`));
    db.exec(`CREATE TABLE IF NOT EXISTS ${this.collectionName} ( ${columns.join(",")});`);
    execWithTry(`CREATE INDEX idx_${this.collectionName}_id ON ${this.collectionName}(id);`);
    if (this.extraCols.length > 0) {
      const suffix = this.extraCols.join("_");
      const columns = this.extraCols.join(",");
      execWithTry(`CREATE INDEX idx_${this.collectionName}_${suffix} ON ${this.collectionName}(${columns});`);
      this.extraCols.forEach((col) => {
        execWithTry(`CREATE INDEX idx_${this.collectionName}_${col} ON ${this.collectionName}(${col});`);
      });
    }
  }

  private initializeHistory() {
    db.exec(
      `CREATE TABLE IF NOT EXISTS ${this.history} ( id TEXT, time TEXT, user TEXT, before BLOB, after BLOB, PRIMARY KEY(id, time) );`,
    );
    execWithTry(`CREATE INDEX idx_${this.history}_id ON ${this.history}(id);`);
  }

  constructor(collection: string, extraCols: string[] = []) {
    this.collectionName = collection;
    this.history = `${collection}history`;
    this.extraCols = extraCols;
    this.initialize();
    this.initializeHistory();
  }

  list(orderBy?: string) {
    return this.listByField("true", orderBy);
  }

  listByIds(list: string[], orderBy?: string) {
    return this.listByField(`id IN (${list.map((each) => `${escape(each)}`).join(",")})`, orderBy);
  }

  listByField(where: string, orderBy = "id ASC") {
    const query = `SELECT data FROM ${this.collectionName} WHERE ${where} ORDER BY ${orderBy};`;
    return (db.prepare(query).all() as { data: string }[]).map((each) => each && JSON.parse(each.data));
  }

  getById(id: string) {
    return this.getByField({ key: "id", val: id });
  }

  getByField(where: { key: string; val: string }) {
    const query = `SELECT data FROM ${this.collectionName} WHERE ${where.key} = ${escape(where.val)};`;
    const result = db.prepare(query).get() as { data: string } | undefined;
    return result ? JSON.parse(result.data) : {};
  }

  private get colsForSave() {
    return ["id", "data"].concat(this.extraCols);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createValsForSave(object: { [ind: string]: any } & { id: string }) {
    return [escape(object.id), asSqliteString(object)].concat(
      this.extraCols.map((col) => {
        return object[col]?.toJSON ? escape(object[col].toJSON()) : escape(object[col]);
      }),
    );
  }

  private saveHistoryEntry(object: { id: string }, user: User) {
    const now = new Date().toJSON();
    const before = JSON.parse(JSON.stringify(this.getById(object.id)));
    const after = JSON.parse(JSON.stringify(object));
    if (!areDifferentForHistoryEntries(before, after)) {
      return; // no need to save unchanged objects
    }
    db.exec(
      `REPLACE INTO ${this.history} ( id, time, user, before, after ) VALUES ( ${escape(object.id)}, ${escape(now)}, ${escape(user.name)}, ${asSqliteString(before)}, ${asSqliteString(object)});`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save(object: { [ind: string]: any } & { id: string }, user: User) {
    const vals = this.createValsForSave(object);
    const trans = db.transaction(() => {
      this.saveHistoryEntry(object, user);
      db.exec(`REPLACE INTO ${this.collectionName} (${this.colsForSave.join(",")}) VALUES (${vals.join(",")});`);
    });
    trans.immediate();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveAll(objects: ({ [ind: string]: any } & { id: string })[], user: User) {
    if (objects.length < 1) {
      return;
    }
    const rows = objects.map((obj) => {
      const vals = this.createValsForSave(obj);
      return `(${vals.join(",")})`;
    });
    const trans = db.transaction(() => {
      objects.forEach((obj) => this.saveHistoryEntry(obj, user));
      db.exec(`REPLACE INTO ${this.collectionName} (${this.colsForSave.join(",")}) VALUES ${rows.join("\n,")};`);
    });
    trans.immediate();
  }

  private removeWithQuery(where: string) {
    return db.exec(`DELETE FROM ${this.collectionName} WHERE ${where};`);
  }

  removeById(id: string, user: User) {
    const trans = db.transaction(() => {
      this.saveHistoryEntry({ id }, user);
      this.removeWithQuery(`id = ${escape(id)}`);
    });
    trans.immediate();
  }

  removeAllByIds(ids: string[], user: User) {
    const trans = db.transaction(() => {
      ids.forEach((id) => this.saveHistoryEntry({ id }, user));
      this.removeWithQuery(`id IN (${ids.map(escape).join(",")})`);
    });
    trans.immediate();
  }
}

export default function (collectionName: string, extraCols?: string[]): Persistence {
  return new Persistence(collectionName, extraCols);
}
