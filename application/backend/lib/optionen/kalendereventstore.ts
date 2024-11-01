import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import User from "jc-shared/user/user.js";
import { KalenderEvents } from "jc-shared/optionen/ferienIcals.js";

const persistence = pers("kalendereventstore");

export default {
  getKalenderEvents: function getKalenderEvents(id: string) {
    const result = persistence.getById(id);
    return misc.toObject<KalenderEvents>(KalenderEvents, result);
  },

  save: function save(event: KalenderEvents) {
    persistence.save(event.toJSON(), new User({ name: "System" }));
    return event;
  },
};
