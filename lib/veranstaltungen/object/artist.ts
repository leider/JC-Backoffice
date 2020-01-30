import misc from "../../commons/misc";

export interface ArtistRaw {
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

export default class Artist implements  ArtistRaw {
  bandname = "";
  name: string[] = [];
  numMusiker = 1;
  numCrew = 0;
  isBawue = false;
  isAusland = false;
  brauchtHotel = false;

  toJSON(): ArtistRaw {
    return this;
  }

  constructor(object?: ArtistRaw) {
    if (object && Object.keys(object).length !== 0) {
      this.bandname = object.bandname;
      this.name = misc.toArray(object.name); // legacy, was text before
      this.numMusiker = object.numMusiker;
      this.numCrew = object.numCrew;
      this.isBawue = object.isBawue;
      this.isAusland = object.isAusland;
      this.brauchtHotel = object.brauchtHotel;
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
