import Database, { SqliteError } from "better-sqlite3";
import conf from "../../../shared/commons/simpleConfigure.js";
import { loggers } from "winston";

const sqlitedb = conf.get("sqlitedb") as string;
const db = new Database(sqlitedb);
const scriptLogger = loggers.get("scripts");
scriptLogger.info(`DB = ${sqlitedb}`);

function asSqliteString(obj: object) {
  return `${escape(JSON.stringify(obj))}`;
}

function escape(str = "") {
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

class Persistence {
  private collectionName: string;
  private extraCols: string[] = [];

  constructor(collName: string, extraCols: string[] = []) {
    this.collectionName = collName;
    this.extraCols = extraCols;
    const columns = ["id TEXT PRIMARY KEY", "data BLOB"].concat(extraCols.map((col) => `${col} TEXT`));
    db.exec(`CREATE TABLE IF NOT EXISTS ${collName} ( ${columns.join(",")});`);
    execWithTry(`CREATE INDEX idx_${collName}_id ON ${collName}(id);`);
    if (extraCols.length > 0) {
      const suffix = extraCols.join("_");
      const columns = extraCols.join(",");
      execWithTry(`CREATE INDEX idx_${collName}_${suffix} ON ${collName}(${columns});`);
    }
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

  get colsForSave() {
    return ["id", "data"].concat(this.extraCols);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createValsForSave(object: { [ind: string]: any } & { id?: string }) {
    return [escape(object.id), asSqliteString(object)].concat(
      this.extraCols.map((col) => {
        return object[col]?.toJSON ? escape(object[col].toJSON()) : escape(object[col]);
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save(object: { [ind: string]: any } & { id?: string }) {
    const vals = this.createValsForSave(object);
    return db.exec(`REPLACE INTO ${this.collectionName} (${this.colsForSave.join(",")}) VALUES (${vals.join(",")});`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveAll(objects: ({ [ind: string]: any } & { id?: string })[]) {
    if (objects.length < 1) {
      return;
    }
    const rows = objects.map((obj) => {
      const vals = this.createValsForSave(obj);
      return `(${vals.join(",")})`;
    });
    return db.exec(`REPLACE INTO ${this.collectionName} (${this.colsForSave.join(",")}) VALUES ${rows.join("\n,")};`);
  }

  removeWithQuery(where: string) {
    return db.exec(`DELETE FROM ${this.collectionName} WHERE ${where};`);
  }

  removeById(id: string) {
    return this.removeWithQuery(`id = ${escape(id)}`);
  }

  removeAllByIds(ids: string[]) {
    return this.removeWithQuery(`id IN (${ids.map(escape).join(",")})`);
  }
}

export default function (collectionName: string, extraCols?: string[]): Persistence {
  return new Persistence(collectionName, extraCols);
}
