import Salesreport from "jc-shared/veranstaltung/salesreport";

import pers from "../persistence/persistenceNew";
import { Lineobject } from "./htmlbridge";

const persistence = pers("reservixstore");

export default {
  getSalesreport: async function getSalesreport(id: string) {
    const result = await persistence.getById(id);
    return new Salesreport(result as any);
  },

  saveAll: async function (objects: Array<Lineobject>) {
    return persistence.saveAll(objects);
  },
};
