import winston from "winston";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";

const persistence = pers("vermietungenstore", ["startDate", "endDate", "url"]);
const logger = winston.loggers.get("transactions");

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: "ASC" | "DESC") {
  const result = persistence.listByField(
    `startDate < '${rangeTo.toISOString}' AND endDate > '${rangeFrom.toISOString}'`,
    `startDate ${sortOrder}`,
  );
  return misc.toObjectList<Vermietung>(Vermietung, result);
}

function byDateRangeInAscendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
  return byDateRange(rangeFrom, rangeTo, "ASC");
}

function byDateRangeInDescendingOrder(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
  return byDateRange(rangeFrom, rangeTo, "DESC");
}

export default {
  zukuenftigeMitGestern: function zukuenftigeMitGestern() {
    const now = new DatumUhrzeit();
    return byDateRangeInAscendingOrder(now.minus({ tage: 1 }), now.plus({ jahre: 10 }));
  },

  zukuenftige: function zukuenftige() {
    const now = new DatumUhrzeit();
    return byDateRangeInAscendingOrder(now, now.plus({ jahre: 10 }));
  },

  vergangene: function vergangene() {
    const now = new DatumUhrzeit();
    return byDateRangeInDescendingOrder(now.minus({ monate: 12 }), now);
  },

  alle: function alle() {
    const now = new DatumUhrzeit();
    return byDateRangeInDescendingOrder(now.minus({ jahre: 20 }), now.plus({ jahre: 10 }));
  },

  byDateRangeInAscendingOrder,

  getVermietung: function getVermietung(url: string) {
    const result = persistence.getByField({ key: "url", val: url });
    return misc.toObject(Vermietung, result);
  },

  getVermietungForId: function getVermietungForId(id: string) {
    const result = persistence.getById(id);
    return misc.toObject(Vermietung, result);
  },

  saveVermietung: function saveVermietung(vermietung: Vermietung) {
    const object = vermietung.toJSON();
    persistence.save(object);
    return vermietung;
  },

  deleteVermietungById: function deleteVermietungById(id: string) {
    persistence.removeById(id);
    logger.info(`Vermietung removed: ${JSON.stringify(id)}`);
    return;
  },
};
