import misc from "../commons/misc.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import keys from "lodash/keys.js";

export default class Technik {
  dateirider: string[] = [];
  technikAngebot1?: string;
  backlineJazzclub: string[] = [];
  backlineRockshop: string[] = [];
  checked = false;
  fluegel = false;

  constructor(object?: RecursivePartial<Technik>) {
    if (object && keys(object).length) {
      Object.assign(this, object, {
        dateirider: object.dateirider || [],
      });
    }
  }

  updateDateirider(datei: string): boolean {
    const imagePushed = misc.pushImage(this.dateirider, datei);
    if (imagePushed) {
      this.dateirider = imagePushed;
      return true;
    }
    return false;
  }

  removeDateirider(datei: string): void {
    this.dateirider = misc.dropImage(this.dateirider, datei);
  }
}
