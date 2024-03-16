/* eslint-disable no-console, no-sync, no-process-exit */
import "jc-backend/configure.js";
import Database from "better-sqlite3";
import conf from "jc-shared/commons/simpleConfigure.js";
import path from "node:path";
import AdmZip from "adm-zip";
import * as fs from "fs";

const sqlitedb = conf.sqlitedb;
const db = new Database(sqlitedb);

const myArgs = process.argv.slice(2);

const outfile = path.join(`${myArgs.length > 0 ? myArgs[0] : ""}`, `backup-JC-sqlite-${new Date().toJSON()}.db`);

function zipIt(outfile: string) {
  const zip = new AdmZip();
  zip.addLocalFile(outfile);
  zip.writeZip(outfile.replace(".db", ".zip"), (err) => {
    if (err) {
      console.log("backup failed during zipping:", err);
      return process.exit(1);
    }
    fs.rmSync(outfile);
  });
}

db.backup(outfile)
  .then(() => {
    zipIt(outfile);
    console.log("backup successful");
  })
  .catch((err) => {
    console.log("backup failed:", err);
    process.exit(1);
  });
