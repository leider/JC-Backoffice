import partial from "lodash/partial";

import misc from "jc-shared/commons/misc";
import pers from "../persistence/persistence";
const persistence = pers("reservixstore");
import Salesreport from "jc-shared/veranstaltung/salesreport";
import { Lineobject } from "./htmlbridge";

function toOptionValues(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(Salesreport, callback, err, jsobject);
}

export default {
  getSalesreport: function getSalesreport(id: string, callback: Function): void {
    persistence.getById(id, partial(toOptionValues, callback));
  },

  saveAll: function (objects: Array<Lineobject>, callback: Function): void {
    persistence.saveAll(objects, callback);
  },
};
