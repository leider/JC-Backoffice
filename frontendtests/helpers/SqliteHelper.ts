import Sqlite from "better-sqlite3";
import serverConfig from "../../config-it/server-config.json";
import fs from "fs";
import path from "path";
const url = serverConfig.sqlitedb;
import Helper from "@codeceptjs/helper";

function asSqliteString(obj) {
  return `${escape(JSON.stringify(obj))}`;
}

function escape(str = "") {
  return `'${str.replaceAll("'", "''")}'`;
}

function doInSqlite(callback) {
  const db = new Sqlite(path.join(__dirname, url));
  const result = callback(db);
  db.close();
  return result;
}

class SqliteHelper extends Helper {
  dropAllCollections() {
    doInSqlite((db) => {
      const tables = db.pragma("table_list");
      tables
        .filter(
          (table) =>
            !table.name.startsWith("sqlite") && table.name !== "refreshstore",
        )
        .forEach((table) => db.exec(`delete from ${table.name}`));
    });
  }

  deleteObjectInCollection(collectionName, id) {
    doInSqlite((db) => {
      db.exec(`delete from ${collectionName} where id = ${escape(id)}`);
    });
  }

  loadObjectInCollection(collectionName, id) {
    const result = doInSqlite((db) => {
      return db
        .prepare(`select data from ${collectionName} where id = ${escape(id)}`)
        .get();
    });
    return JSON.parse(result.data);
  }

  createData(collectionName, filename) {
    doInSqlite((db) => {
      const json = fs.readFileSync(
        `${__dirname}/../data/${collectionName}/${filename}.json`,
        "utf8",
      );
      const object = JSON.parse(json);
      this.storeInCollection(db, collectionName, object);
    });
  }

  createObject(collectionName, object) {
    doInSqlite((db) => {
      this.storeInCollection(db, collectionName, object);
    });
  }

  storeInCollection(db, collectionName, object) {
    const extraCols = [];
    if (
      collectionName === "veranstaltungenstore" ||
      collectionName === "vermietungenstore"
    ) {
      extraCols.push("startDate", "endDate", "url");
    } else if (collectionName === "terminstore") {
      extraCols.push("startDate", "endDate");
    }

    const cols = ["id", "data"].concat(extraCols);
    const vals = [escape(object.id), asSqliteString(object)].concat(
      extraCols.map((col) => escape(object[col])),
    );
    db.exec(
      `REPLACE INTO ${collectionName} (${cols.join(",")}) VALUES (${vals.join(
        ",",
      )});`,
    );
  }
}

export = SqliteHelper;
