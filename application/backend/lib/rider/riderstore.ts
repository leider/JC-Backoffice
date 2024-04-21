import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import { Rider } from "jc-shared/rider/rider.js";
import User from "jc-shared/user/user.js";

const persistence = pers("riderstore");

export default {
  getRider: function getRider(url: string) {
    const result = persistence.getById(url);
    return misc.toObject<Rider>(Rider, result);
  },

  saveRider: function saveRider(object: Rider, user: User) {
    persistence.save(object.toJSON() as Rider, user);
    return object;
  },
};
