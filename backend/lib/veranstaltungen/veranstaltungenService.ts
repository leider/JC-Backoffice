const __dirname = new URL(".", import.meta.url).pathname;
import AdmZip from "adm-zip";
import { NextFunction, Response } from "express";
import flatten from "lodash/flatten.js";
import fs from "fs";
import path from "path";

import Veranstaltung from "jc-shared/veranstaltung//veranstaltung.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

import store from "./veranstaltungenstore.js";

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

function zipVeranstaltungen(veranstaltungen: Veranstaltung[], name: string, res: Response, next: NextFunction) {
  try {
    const images = flatten(veranstaltungen.map((veranst) => veranst.presse.image))
      // eslint-disable-next-line no-sync
      .filter((filename) => fs.existsSync(uploadDir + "/" + filename))
      .map((filename) => {
        return { path: uploadDir + "/" + filename, name: filename };
      });
    const filename = `Jazzclub Bilder ${name}.zip`;

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

async function imgzip(res: Response, next: NextFunction, yymm: string) {
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  const name = start.monatJahrKompakt;
  const veranstaltungen = await store.byDateRangeInAscendingOrder(start, end);
  zipVeranstaltungen(veranstaltungen, name, res, next);
}

async function imgzipForVeranstaltung(res: Response, next: NextFunction, url: string) {
  const name = url;
  const veranstaltung = await getVeranstaltung(url);
  if (!veranstaltung) {
    return;
  }
  const veranstaltungen: Veranstaltung[] = [veranstaltung];
  zipVeranstaltungen(veranstaltungen, name, res, next);
}

export default {
  getVeranstaltung,
  filterUnbestaetigteFuerJedermann,
  imgzip,
  imgzipForVeranstaltung,
};
