import pers from "../persistence/persistence.js";
import misc from "jc-shared/commons/misc.js";
import { Rider } from "jc-shared/rider/rider.js";

const persistence = pers("riderstore");

export default {
  getRider: async function getRider(url: string) {
    const result = await persistence.getById(url);
    return misc.toObject<Rider>(Rider, result);
  },

  saveRider: async function saveRider(object: Rider) {
    await persistence.save(object.toJSON());
    return object;
  },
};
