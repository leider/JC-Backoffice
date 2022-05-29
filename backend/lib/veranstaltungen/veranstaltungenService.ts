// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipstream = require("zip-stream");
import { NextFunction, Response } from "express";
import flatten from "lodash/flatten";
import fs from "fs";
import async from "async";
import path from "path";

import Veranstaltung from "jc-shared/veranstaltung//veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import User from "jc-shared/user/user";

import store from "./veranstaltungenstore";
import { salesreportFor } from "../reservix/reservixService";

const uploadDir = path.join(__dirname, "../../static/upload");

async function getVeranstaltungMitReservix(url: string) {
  const veranstaltung = await store.getVeranstaltung(url);
  if (!veranstaltung) {
    return null;
  }
  const salesreport = await salesreportFor(veranstaltung.reservixID);
  veranstaltung.associateSalesreport(salesreport);
  return veranstaltung;
}

function filterUnbestaetigteFuerJedermann(veranstaltungen: Veranstaltung[], user?: User): Veranstaltung[] {
  if (user?.accessrights?.isBookingTeam) {
    return veranstaltungen;
  }
  return veranstaltungen.filter((v) => v.kopf.confirmed);
}

async function imgzip(res: Response, next: NextFunction, yymm: string) {
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  try {
    const result = await store.byDateRangeInAscendingOrder(start, end);
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
  } catch (e) {
    next(e);
  }
}

export default {
  getVeranstaltungMitReservix,
  filterUnbestaetigteFuerJedermann,
  imgzip,
};
