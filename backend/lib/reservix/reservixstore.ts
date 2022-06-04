import Salesreport from "jc-shared/veranstaltung/salesreport";

import pers from "../persistence/persistence";
import { Lineobject } from "./htmlbridge";
import misc from "jc-shared/commons/misc";

const persistence = pers("reservixstore");

export default {
  getSalesreport: async function getSalesreport(id: string) {
    const result = await persistence.getById(id);
    return misc.toObject(Salesreport, result);
  },

  saveAll: async function (objects: Lineobject[]) {
    await persistence.saveAll(objects);
    return objects;
  },
};
