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

class dbHelper extends Helper {
  dropAllCollections() {
    console.log("DROP");
    const db = new sqlite(url);
    const tables = db.pragma("table_list");
    tables
      .filter((table) => !table.name.startsWith("sqlite") && table.name !== "refreshstore")
      .forEach((table) => db.exec(`delete from ${table.name}`));
    db.close();
  }

  deleteObjectInCollection(collectionName, id) {
    console.log(`DELETE OBJECT ${id} IN COLLECTION ${collectionName}`);
    const db = new sqlite(url);
    db.exec(`delete from ${collectionName} where id = ${escape(id)}`);
    db.close();
  }

  loadObjectInCollection(collectionName, id) {
    const db = new sqlite(url);
    const result = db.prepare(`select data from ${collectionName} where id = ${escape(id)}`).get();
    db.close();
    return JSON.parse(result.data);
  }

  createData(collectionName, filename) {
    console.log(`CREATE OBJECT ${filename} IN COLLECTION ${collectionName}`);
    const json = fs.readFileSync(`${__dirname}/../data/${collectionName}/${filename}.json`, "utf8");
    const object = JSON.parse(json);
    const db = new sqlite(url);

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
    db.close();
  }
}
module.exports = dbHelper;
