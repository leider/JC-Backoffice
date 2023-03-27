import OptionValues from "jc-shared/optionen/optionValues.js";
import Orte from "jc-shared/optionen/orte.js";
import FerienIcals from "jc-shared/optionen/ferienIcals.js";

import pers from "../persistence/persistence.js";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("optionenstore");

export default {
  get: async function get() {
    const result = await persistence.getById("instance");
    return misc.toObject(OptionValues, result);
  },

  orte: async function orte() {
    const result = await persistence.getById("orte");
    return misc.toObject(Orte, result);
  },

  icals: async function icals() {
    const result = await persistence.getById("ferienIcals");
    return misc.toObject(FerienIcals, result);
  },

  save: async function save(object: OptionValues | Orte | FerienIcals) {
    await persistence.save(object.toJSON());
    return object;
  },
};
