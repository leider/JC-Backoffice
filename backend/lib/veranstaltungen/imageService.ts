import path from "path";
import fs from "fs";
import async, { ErrorCallback } from "async";

import Veranstaltung, { ImageOverviewRow } from "../../../shared/veranstaltung/veranstaltung";

import store from "./veranstaltungenstore";
const uploadDir = path.join(__dirname, "../../static/upload");

function renameImage(oldname: string, newname: string, veranstIds: string[], callback: ErrorCallback): void {
  fs.rename(uploadDir + "/" + oldname, uploadDir + "/" + newname, (err) => {
    if (err) {
      return callback(err);
    }
    function updateVeranstaltung(id: string, cb: Function): void {
      store.getVeranstaltungForId(id, (err1: Error | null, veranstaltung: Veranstaltung) => {
        if (err1 || !veranstaltung) {
          return cb(err1);
        }
        veranstaltung.updateImageName(oldname, newname);
        store.saveVeranstaltung(veranstaltung, cb);
      });
    }

    async.each(veranstIds, updateVeranstaltung, callback);
  });
}

function renameImages(rows: ImageOverviewRow[], callback: ErrorCallback): void {
  function renameRow(row: ImageOverviewRow, cb: ErrorCallback): void {
    renameImage(
      row.image,
      row.newname,
      row.veranstaltungen.map((v) => v.id),
      cb
    );
  }
  async.each(rows, renameRow, callback);
}

export default {
  renameImages,

  alleBildNamen: function alleBildNamen(callback: Function): void {
    fs.readdir(uploadDir, (err, files) => {
      callback(err, files.sort());
    });
  },
};
