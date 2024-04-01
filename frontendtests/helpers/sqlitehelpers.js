const sqlite = require("better-sqlite3");
const serverConfig = require("../../config-it/server-config.json");
const Helper = require("@codeceptjs/helper");
const fs = require("fs");
const url = serverConfig.sqlitedb;

function asSqliteString(obj) {
  return `${escape(JSON.stringify(obj))}`;
}

function escape(str = "") {
  return `'${str.replaceAll("'", "''")}'`;
}

function doInSqlite(callback) {
  const db = new sqlite(url);
  const result = callback(db);
  db.close();
  return result;
}

class dbHelper extends Helper {
  dropAllCollections() {
    doInSqlite((db) => {
      const tables = db.pragma("table_list");
      tables
        .filter((table) => !table.name.startsWith("sqlite") && table.name !== "refreshstore")
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
      return db.prepare(`select data from ${collectionName} where id = ${escape(id)}`).get();
    });
    return JSON.parse(result.data);
  }

  createData(collectionName, filename) {
    doInSqlite((db) => {
      const json = fs.readFileSync(`${__dirname}/../data/${collectionName}/${filename}.json`, "utf8");
      const object = JSON.parse(json);

      const extraCols = [];
      if (collectionName === "veranstaltungenstore" || collectionName === "vermietungenstore") {
        extraCols.push(["startDate", "endDate", "url"]);
      } else if (collectionName === "terminstore") {
        extraCols.push(["startDate", "endDate"]);
      }

      const cols = ["id", "data"];
      if (extraCols) {
        cols.push(...extraCols);
      }
      const vals = [escape(object.id), asSqliteString(object)];
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
      db.exec(`REPLACE INTO ${collectionName} (${cols.join(",")}) VALUES (${vals.join(",")});`);
    });
  }

  storeInCollection(collectionName, data) {}
}
module.exports = dbHelper;
