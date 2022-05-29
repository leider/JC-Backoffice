import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import FerienIcals from "jc-shared/optionen/ferienIcals";

import pers from "../persistence/persistenceNew";

const persistence = pers("optionenstore");

export default {
  get: async function get() {
    const result = await persistence.getById("instance");
    return new OptionValues(result);
  },

  orte: async function orte() {
    const result = await persistence.getById("orte");
    return new Orte(result);
  },

  icals: async function icals() {
    const result = await persistence.getById("ferienIcals");
    return new FerienIcals(result);
  },

  save: async function save(object: OptionValues | Orte | FerienIcals) {
    return persistence.save(object.toJSON());
  },
};
