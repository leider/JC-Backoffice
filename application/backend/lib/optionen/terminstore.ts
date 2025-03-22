import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Termin from "jc-shared/optionen/termin.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import User from "jc-shared/user/user.js";

const persistence = pers("terminstore", ["startDate", "endDate"]);

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: "ASC" | "DESC") {
  const result = persistence.listByField(
    `startDate < '${rangeTo.toISOString}' AND endDate > '${rangeFrom.toISOString}'`,
    `startDate ${sortOrder}`,
  );

  return misc.toObjectList(Termin, result);
}

export default {
  alle: function alle() {
    const result = persistence.list("startDate DESC");
    return misc.toObjectList(Termin, result);
  },

  save: function save(termin: Termin, user: User) {
    persistence.save(termin, user);
    return termin;
  },

  saveAll: function saveAll(termine: Termin[], user: User) {
    persistence.saveAll(termine, user);
    return termine;
  },

  termineBetween: function termineBetween(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
    return byDateRange(rangeFrom, rangeTo, "DESC");
  },

  remove: function remove(id: string, user: User) {
    persistence.removeById(id, user);
  },

  removeAll: function removeAll(ids: string[], user: User) {
    persistence.removeAllByIds(ids, user);
  },
};
