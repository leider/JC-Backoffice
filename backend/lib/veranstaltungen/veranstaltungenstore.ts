import winston from "winston";

import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("veranstaltungenstore", ["startDate", "endDate", "url"]);
const logger = winston.loggers.get("transactions");

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: "ASC" | "DESC") {
  const result = persistence.listByField(
    `startDate < '${rangeTo.toISOString}' AND endDate > '${rangeFrom.toISOString}'`,
    `startDate ${sortOrder}`,
  );
  return misc.toObjectList<Veranstaltung>(Veranstaltung, result);
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

  getVeranstaltung: function getVeranstaltung(url: string) {
    const result = persistence.getByField({ key: "url", val: url });
    return misc.toObject<Veranstaltung>(Veranstaltung, result);
  },

  getVeranstaltungForId: function getVeranstaltungForId(id: string) {
    const result = persistence.getById(id);
    return misc.toObject<Veranstaltung>(Veranstaltung, result);
  },

  saveVeranstaltung: function saveVeranstaltung(veranstaltung: Veranstaltung) {
    const object = veranstaltung.toJSON();
    persistence.save(object);
    return veranstaltung;
  },

  deleteVeranstaltungById: function deleteVeranstaltungById(id: string) {
    persistence.removeById(id);
    logger.info(`Veranstaltung removed: ${JSON.stringify(id)}`);
    return;
  },
};
