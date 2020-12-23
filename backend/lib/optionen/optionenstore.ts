import partial from "lodash/partial";

import misc from "jc-shared/commons/misc";
import pers from "../persistence/persistence";
const persistence = pers("optionenstore");
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import FerienIcals from "jc-shared/optionen/ferienIcals";

function toOptionValues(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(OptionValues, callback, err, jsobject);
}

function toOrte(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(Orte, callback, err, jsobject);
}

function toIcals(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(FerienIcals, callback, err, jsobject);
}

export default {
  get: function get(callback: Function): void {
    persistence.getById("instance", partial(toOptionValues, callback));
  },

  orte: function orte(callback: Function): void {
    persistence.getById("orte", partial(toOrte, callback));
  },

  icals: function icals(callback: Function): void {
    persistence.getById("ferienIcals", partial(toIcals, callback));
  },

  save: function save(object: OptionValues | Orte | FerienIcals, callback: Function): void {
    persistence.save(object.toJSON(), callback);
  },
};
