// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipstream = require("zip-stream");
import { NextFunction, Response } from "express";
import flatten from "lodash/flatten";
import fs from "fs";
import async from "async";
import path from "path";

import Veranstaltung from "jc-shared/veranstaltung//veranstaltung";
import Salesreport from "jc-shared/veranstaltung/salesreport";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import User from "jc-shared/user/user";

import store from "./veranstaltungenstore";
import { salesreportFor } from "../reservix/reservixService";
const uploadDir = path.join(__dirname, "../../static/upload");

function getVeranstaltungMitReservix(url: string, callback: Function): void {
  store.getVeranstaltung(url, (err: Error | null, veranstaltung?: Veranstaltung) => {
    if (err) {
      return callback(err);
    }
    if (!veranstaltung) {
      return callback(null, null);
    }
    return salesreportFor(veranstaltung.reservixID, (salesreport?: Salesreport) => {
      veranstaltung.associateSalesreport(salesreport);
      callback(null, veranstaltung);
    });
  });
}

function filterUnbestaetigteFuerJedermann(veranstaltungen: Veranstaltung[], user?: User): Veranstaltung[] {
  if (user?.accessrights?.isBookingTeam) {
    return veranstaltungen;
  }
  return veranstaltungen.filter((v) => v.kopf.confirmed);
}

function imgzip(res: Response, next: NextFunction, yymm: string): void {
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, result: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    const images = flatten(result.map((veranst) => veranst.presse.image))
      // eslint-disable-next-line no-sync
      .filter((filename) => fs.existsSync(uploadDir + "/" + filename))
      .map((filename) => {
        return { path: uploadDir + "/" + filename, name: filename };
      });
    const filename = "Jazzclub Bilder " + start.monatJahrKompakt + ".zip";

    res.type("zip");
    res.header("Content-Disposition", 'attachment; filename="' + filename + '"');

    const zip = zipstream({ level: 1 });
    zip.pipe(res); // res is a writable stream

    return async.forEachSeries(
      images,
      (file, cb) => {
        zip.entry(fs.createReadStream(file.path), { name: file.name }, cb);
      },
      (err1) => {
        if (err1) {
          return next(err1);
        }
        return zip.finalize();
      }
    );
  });
}

export default {
  getVeranstaltungMitReservix,
  filterUnbestaetigteFuerJedermann,
  imgzip,
};
