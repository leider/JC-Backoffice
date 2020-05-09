import partial from "lodash/partial";

import misc from "../commons/misc";
import pers from "../persistence/persistence";
const persistence = pers("optionenstore");
import OptionValues from "./optionValues";
import EmailAddresses from "./emailAddresses";
import Orte from "./orte";
import FerienIcals from "./ferienIcals";

function toOptionValues(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(OptionValues, callback, err, jsobject);
}

function toEmailAddresses(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(EmailAddresses, callback, err, jsobject);
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

  emailAddresses: function emailAddresses(callback: Function): void {
    persistence.getById("emailaddresses", partial(toEmailAddresses, callback));
  },

  orte: function orte(callback: Function): void {
    persistence.getById("orte", partial(toOrte, callback));
  },

  icals: function icals(callback: Function): void {
    persistence.getById("ferienIcals", partial(toIcals, callback));
  },

  save: function save(object: OptionValues | Orte | EmailAddresses | FerienIcals, callback: Function): void {
    persistence.save(object.toJSON() as { id: string }, callback);
  },
};
