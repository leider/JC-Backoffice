import misc from '../../commons/misc';

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

export default class Artist {
  state: ArtistRaw;

  toJSON(): ArtistRaw {
    return this.state;
  }

  constructor(object: ArtistRaw | undefined) {
    this.state = object || {
      bandname: '',
      name: [],
      numMusiker: 1,
      numCrew: 0,
      isBawue: false,
      isAusland: false,
      brauchtHotel: false
    };
    this.state.name = misc.toArray(this.state.name); // legacy, was text before
  }

  fillFromUI(object: ArtistUI): Artist {
    this.state.bandname = object.bandname || '';
    this.state.name = misc.toArray(object.name);
    this.state.numCrew = parseFloat(object.numCrew || '') || 0;
    this.state.numMusiker = parseFloat(object.numMusiker || '') || 0;
    this.state.isAusland = !!object.isAusland;
    this.state.isBawue = !!object.isBawue;
    this.state.brauchtHotel = !!object.brauchtHotel;
    return this;
  }

  isAusland(): boolean {
    return this.state.isAusland;
  }

  isBawue(): boolean {
    return this.state.isBawue;
  }

  brauchtHotel(): boolean {
    return this.state.brauchtHotel;
  }

  bandname(): string {
    return this.state.bandname;
  }

  name(): string[] {
    return this.state.name;
  }

  numMusiker(): number {
    return this.state.numMusiker;
  }

  numCrew(): number {
    return this.state.numCrew || 0;
  }

  numForCatering(): number {
    return this.numMusiker() + this.numCrew();
  }
}
