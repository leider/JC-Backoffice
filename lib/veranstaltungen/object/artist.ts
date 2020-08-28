import misc from "../../commons/misc";

export default class Artist {
  bandname = "";
  name: string[] = [];
  numMusiker = 1;
  numCrew = 0;
  isBawue = false;
  isAusland = false;
  brauchtHotel = false;

  toJSON(): object {
    return Object.assign({}, this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        name: misc.toArray(object.name), // legacy, was text before
      });
    }
  }
}
