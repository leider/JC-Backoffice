import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import { Rider } from "jc-shared/rider/rider.js";

const persistence = pers("riderstore");

export default {
  getRider: function getRider(url: string) {
    const result = persistence.getById(url);
    return misc.toObject<Rider>(Rider, result);
  },

  saveRider: function saveRider(object: Rider) {
    persistence.save(object.toJSON());
    return object;
  },
};
