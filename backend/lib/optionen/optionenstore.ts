import OptionValues from "jc-shared/optionen/optionValues.js";
import Orte from "jc-shared/optionen/orte.js";
import FerienIcals from "jc-shared/optionen/ferienIcals.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import User from "jc-shared/user/user.js";

const persistence = pers("optionenstore");

export default {
  get: function get() {
    const result = persistence.getById("instance");
    return misc.toObject<OptionValues>(OptionValues, result);
  },

  orte: function orte() {
    const result = persistence.getById("orte");
    return misc.toObject<Orte>(Orte, result);
  },

  icals: function icals() {
    const result = persistence.getById("ferienIcals");
    return misc.toObject<FerienIcals>(FerienIcals, result);
  },

  save: function save(object: OptionValues | Orte | FerienIcals, user: User) {
    persistence.save(object.toJSON(), user);
    return object;
  },
};
