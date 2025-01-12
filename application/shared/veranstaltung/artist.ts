import misc from "../commons/misc.js";
import Misc from "../commons/misc.js";
import keys from "lodash/keys.js";

export type BandTransport = "Band kommt selbst" | "Band abholen (Auto)" | "Band abholen (Transporter)";

export default class Artist {
  bandname = "";
  name: string[] = [];
  numMusiker = 1;
  numCrew = 0;
  isBawue = false;
  isAusland = false;
  brauchtHotel = false;
  getInForMasterDate?: Date;
  bandTransport?: BandTransport;

  toJSON(): object {
    return Object.assign({}, this);
  }

  constructor(object?: Omit<Artist, "getInForMasterDate"> & { getInForMasterDate: string | Date }) {
    if (object && keys(object).length !== 0) {
      const getIn = Misc.stringOrDateToDate(object.getInForMasterDate);
      Object.assign(this, object, {
        name: misc.toArray(object.name), // legacy, was text before
        getInForMasterDate: getIn,
        bandTransport: object.bandTransport,
      });
    }
  }
}
