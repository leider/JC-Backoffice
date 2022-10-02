import AdmZip from "adm-zip";
import { NextFunction, Response } from "express";
import flatten from "lodash/flatten";
import fs from "fs";
import path from "path";

import Veranstaltung from "jc-shared/veranstaltung//veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import User from "jc-shared/user/user";

import store from "./veranstaltungenstore";

const uploadDir = path.join(__dirname, "../../static/upload");

async function getVeranstaltung(url: string) {
  const veranstaltung = await store.getVeranstaltung(url);
  if (!veranstaltung) {
    return null;
  }
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

    const zip = new AdmZip();
    images.forEach((file) => {
      zip.addLocalFile(file.path, undefined, file.name);
    });

    const buffer = zip.toBuffer();
    res.end(buffer);
  } catch (e) {
    next(e);
  }
}

export default {
  getVeranstaltung,
  filterUnbestaetigteFuerJedermann,
  imgzip,
};
