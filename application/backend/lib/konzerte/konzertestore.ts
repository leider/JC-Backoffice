import winston from "winston";

import Konzert from "jc-shared/konzert/konzert.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import User from "jc-shared/user/user.js";

const persistence = pers("veranstaltungenstore", ["startDate", "endDate", "url"]);
const logger = winston.loggers.get("transactions");
import conf from "../../simpleConfigure.js";
import optionenstore from "../optionen/optionenstore.js";
import groupBy from "lodash/groupBy.js";

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: "ASC" | "DESC") {
  const result = persistence.listByField(
    `startDate < '${rangeTo.toISOString}' AND endDate > '${rangeFrom.toISOString}'`,
    `startDate ${sortOrder}`,
  );
  return misc.toObjectList(Konzert, result);
}

function byDateRangeInAscendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
  return byDateRange(rangeFrom, rangeTo, "ASC");
}

function byDateRangeInDescendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
  return byDateRange(rangeFrom, rangeTo, "DESC");
}

function now() {
  return DatumUhrzeit.forISOString(conf.nowForDevelopment);
}

export default {
  zukuenftigeMitGestern: function zukuenftigeMitGestern() {
    return byDateRangeInAscendingOrder(now().minus({ tage: 1 }), now().plus({ jahre: 10 }));
  },

  vergangene: function vergangene() {
    return byDateRangeInDescendingOrder(now().minus({ monate: 24 }), now());
  },

  alle: function alle() {
    return byDateRangeInDescendingOrder(now().minus({ jahre: 20 }), now().plus({ jahre: 10 }));
  },

  byDateRangeInAscendingOrder,

  getKonzert(url: string) {
    const result = persistence.getByField({ key: "url", val: url });
    return misc.toObject(Konzert, result);
  },

  getKonzertForId(id: string) {
    const result = persistence.getById(id);
    return misc.toObject(Konzert, result);
  },

  saveKonzert(konzert: Konzert, user: User) {
    // update eventTypRich on save
    const optionen = optionenstore.get();
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    konzert.kopf.eventTypRich = typByName[konzert.kopf.eventTyp]?.[0];

    persistence.save(konzert as { id: string }, user);
    return konzert;
  },

  deleteKonzertById(id: string, user: User) {
    persistence.removeById(id, user);
    logger.info(`Konzert removed: ${JSON.stringify(id)}`);
  },
};
