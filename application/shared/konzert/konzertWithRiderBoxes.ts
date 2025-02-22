import Konzert from "./konzert.js";
import { BoxParams } from "../rider/rider.js";
import { RecursivePartial } from "../commons/advancedTypes.js";

export default class KonzertWithRiderBoxes extends Konzert {
  riderBoxes?: BoxParams[] | undefined;

  constructor(
    object?: RecursivePartial<Omit<Konzert, "startDate" | "endDate"> & { startDate: string | Date; endDate: string | Date }> & {
      riderBoxes?: BoxParams[];
    },
  ) {
    super(object);
    this.riderBoxes = object?.riderBoxes;
  }
}
