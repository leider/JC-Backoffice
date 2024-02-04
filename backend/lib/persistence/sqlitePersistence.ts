import Database, { SqliteError } from "better-sqlite3";
import conf from "../../../shared/commons/simpleConfigure.js";

const sqlitedb = conf.get("sqlitedb") as string;
const db = new Database(sqlitedb);
import { loggers } from "winston";
const scriptLogger = loggers.get("scripts");
scriptLogger.info(`DB = ${sqlitedb}`);

function asSqliteString(obj: object) {
  return `${escape(JSON.stringify(obj))}`;
}

function escape(str = "") {
  return `'${str.replaceAll("'", "''")}'`;
}

function execWithTry(command: string) {
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
  private extraCols?: string[];

  constructor(collName: string, extraCols?: string[]) {
    this.collectionName = collName;
    this.extraCols = extraCols;
    const columns = ["id TEXT PRIMARY KEY", "data BLOB"];
    if (extraCols) {
      const newCols = extraCols.map((col) => `${col} TEXT`);
      columns.push(...newCols);
    }
    db.exec(`CREATE TABLE IF NOT EXISTS ${collName} ( ${columns.join(",")});`);
    execWithTry(`CREATE INDEX idx_${collName}_id ON ${collName}(id);`);
    if (extraCols) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save(object: { [ind: string]: any } & { id?: string }) {
    const cols = ["id", "data"];
    if (this.extraCols) {
      cols.push(...this.extraCols);
    }
    const vals: string[] = [escape(object.id), asSqliteString(object)];
    if (this.extraCols) {
      vals.push(
        ...this.extraCols.map((col) => {
          if (col === "startDate" || col === "endDate") {
            return escape(object[col].toJSON());
          }
          return escape(object[col]);
        }),
      );
    }
    const query = `REPLACE INTO ${this.collectionName} (${cols.join(",")}) VALUES (${vals.join(",")});`;
    return db.exec(query);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveAll(objects: ({ [ind: string]: any } & { id?: string })[]) {
    if (objects.length < 1) {
      return;
    }
    const cols = ["id", "data"];
    if (this.extraCols) {
      cols.push(...this.extraCols);
    }
    const rows = objects.map((obj) => {
      const vals: string[] = [escape(obj.id), asSqliteString(obj)];
      if (this.extraCols) {
        vals.push(...this.extraCols.map((col) => escape(obj[col])));
      }
      return `(${vals.join(",")})`;
    });
    const query = `REPLACE INTO ${this.collectionName} (${cols.join(",")}) VALUES ${rows.join("\n,")};`;
    return db.exec(query);
  }

  removeWithQuery(where: string) {
    const query = `DELETE FROM ${this.collectionName} WHERE ${where};`;
    return db.exec(query);
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
