import optionenstore from "../optionen/optionenstore.js";

import AdmZip from "adm-zip";
import { NextFunction, Response } from "express";
import flatten from "lodash/flatten.js";
import fs from "fs";

import Konzert from "jc-shared/konzert/konzert.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

import store from "./konzertestore.js";
import groupBy from "lodash/groupBy.js";
import conf from "jc-shared/commons/simpleConfigure.js";

function getKonzert(url: string) {
  return store.getKonzert(url);
}

function filterUnbestaetigteFuerJedermann(konzerte: Konzert[], user: User) {
  const optionen = optionenstore.get();
  const typByName = groupBy(optionen?.typenPlus || [], "name");
  const enrichedKonzerte = konzerte.map((v) => {
    v.kopf.eventTypRich = typByName[v.kopf.eventTyp]?.[0];
    return v;
  });
  if (user.accessrights.isBookingTeam) {
    return enrichedKonzerte;
  }
  return enrichedKonzerte.filter((v) => v.kopf.confirmed);
}

function zipKonzerte(konzerte: Konzert[], name: string, res: Response, next: NextFunction) {
  try {
    const images = flatten(konzerte.map((konzert) => konzert.presse.image))
      // eslint-disable-next-line no-sync
      .filter((filename) => fs.existsSync(conf.uploadDir + "/" + filename))
      .map((filename) => {
        return { path: conf.uploadDir + "/" + filename, name: filename };
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

function imgzip(res: Response, next: NextFunction, yymm: string) {
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  const name = start.monatJahrKompakt;
  const konzerte = store.byDateRangeInAscendingOrder(start, end);
  zipKonzerte(konzerte, name, res, next);
}

function imgzipForKonzert(res: Response, next: NextFunction, url: string) {
  const name = url;
  const konzert = getKonzert(url);
  if (!konzert) {
    return;
  }
  const konzerte: Konzert[] = [konzert];
  zipKonzerte(konzerte, name, res, next);
}

export default {
  getKonzert: getKonzert,
  filterUnbestaetigteFuerJedermann,
  imgzip,
  imgzipForKonzert: imgzipForKonzert,
};
