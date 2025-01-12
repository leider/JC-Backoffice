import optionenstore from "../optionen/optionenstore.js";

import AdmZip from "adm-zip";
import { NextFunction, Response } from "express";
import fs from "fs";

import Konzert from "jc-shared/konzert/konzert.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

import store from "./konzertestore.js";
import groupBy from "lodash/groupBy.js";
import conf from "jc-shared/commons/simpleConfigure.js";
import map from "lodash/map.js";
import flatMap from "lodash/flatMap.js";
import forEach from "lodash/forEach.js";
import filter from "lodash/filter.js";

function getKonzert(url: string) {
  return store.getKonzert(url);
}

function filterUnbestaetigteFuerJedermann(konzerte: Konzert[], user: User) {
  const optionen = optionenstore.get();
  const typByName = groupBy(optionen?.typenPlus || [], "name");
  const enrichedKonzerte = map(konzerte, (konz) => {
    konz.kopf.eventTypRich = typByName[konz.kopf.eventTyp]?.[0];
    return konz;
  });
  if (user.accessrights.isBookingTeam) {
    return enrichedKonzerte;
  }
  return filter(enrichedKonzerte, "kopf.confirmed");
}

function zipKonzerte(konzerte: Konzert[], name: string, res: Response, next: NextFunction) {
  function pathFor(name: string) {
    return conf.uploadDir + "/" + name;
  }
  try {
    const zip = new AdmZip();

    forEach(
      filter(flatMap(konzerte, "presse.image"), (filename) => fs.existsSync(pathFor(filename))),
      (filename) => zip.addLocalFile(pathFor(filename), undefined, filename),
    );
    const buffer = zip.toBuffer();

    res.type("zip");
    res.header("Content-Disposition", `attachment; filename="Jazzclub Bilder ${name}.zip"`);
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
