import path from "path";
import fs from "fs";
import async, { ErrorCallback } from "async";

import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";

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

export default {
  renameImage,

  alleBildNamen: function alleBildNamen(callback: Function): void {
    fs.readdir(uploadDir, (err, files) => {
      callback(err, files.sort());
    });
  },
};
