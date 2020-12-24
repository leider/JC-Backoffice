import partial from "lodash/partial";

import misc from "../../../shared/commons/misc";
import OptionValues from "../../../shared/optionen/optionValues";
import Orte from "../../../shared/optionen/orte";
import FerienIcals from "../../../shared/optionen/ferienIcals";

import pers from "../persistence/persistence";
const persistence = pers("optionenstore");

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
