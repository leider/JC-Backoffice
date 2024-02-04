import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Termin from "jc-shared/optionen/termin.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("terminstore", ["startDate", "endDate"]);

function byDateRange(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit, sortOrder: "ASC" | "DESC") {
  const result = persistence.listByField(
    `startDate < '${rangeTo.toISOString}' AND endDate > '${rangeFrom.toISOString}'`,
    `startDate ${sortOrder}`,
  );

  return misc.toObjectList<Termin>(Termin, result);
}

export default {
  alle: function alle() {
    const result = persistence.list("startDate DESC");
    return misc.toObjectList(Termin, result);
  },

  save: function save(termin: Termin) {
    persistence.save(termin.toJSON());
    return termin;
  },

  saveAll: function saveAll(termine: Termin[]) {
    persistence.saveAll(termine);
    return termine;
  },

  termineBetween: function termineBetween(rangeFrom: DatumUhrzeit, rangeTo: DatumUhrzeit) {
    return byDateRange(rangeFrom, rangeTo, "DESC");
  },

  remove: function remove(id: string) {
    return persistence.removeById(id);
  },

  removeAll: function removeAll(ids: string[]) {
    return persistence.removeAllByIds(ids);
  },
};
