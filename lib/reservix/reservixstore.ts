import R from "ramda";

import misc from "../commons/misc";
import pers from "../persistence/persistence";
const persistence = pers("reservixstore");
import Salesreport from "./salesreport";

function toOptionValues(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(Salesreport, callback, err, jsobject);
}

export default {
  getSalesreport: function getSalesreport(id: string, callback: Function): void {
    persistence.getById(id, R.partial(toOptionValues, [callback]));
  },

  saveAll: function(objects: Array<any>, callback: Function): void {
    persistence.saveAll(objects, callback);
  }
};
