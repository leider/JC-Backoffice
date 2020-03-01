import misc from "../../commons/misc";

interface ArtistRaw {
  bandname: string;
  name: string[];
  numMusiker: number;
  numCrew: number;
  isBawue: boolean;
  isAusland: boolean;
  brauchtHotel: boolean;
}

export interface ArtistUI {
  bandname?: string;
  name?: string[];
  numMusiker?: string;
  numCrew?: string;
  isBawue?: string;
  isAusland?: string;
  brauchtHotel?: string;
}

export default class Artist {
  bandname = "";
  name: string[] = [];
  numMusiker = 1;
  numCrew = 0;
  isBawue = false;
  isAusland = false;
  brauchtHotel = false;

  toJSON(): {} {
    return Object.assign({}, this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        name: misc.toArray(object.name) // legacy, was text before
      });
    }
  }

  fillFromUI(object: ArtistUI): Artist {
    this.bandname = object.bandname || "";
    this.name = misc.toArray(object.name);
    this.numCrew = parseFloat(object.numCrew || "") || 0;
    this.numMusiker = parseFloat(object.numMusiker || "") || 0;
    this.isAusland = !!object.isAusland;
    this.isBawue = !!object.isBawue;
    this.brauchtHotel = !!object.brauchtHotel;
    return this;
  }

  numForCatering(): number {
    return this.numMusiker + this.numCrew;
  }
}
