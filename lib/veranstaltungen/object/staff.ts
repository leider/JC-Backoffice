import misc from '../../commons/misc';
import R from 'ramda';
import User from '../../users/user';

export type StaffType =
  | 'techniker'
  | 'technikerV'
  | 'merchandise'
  | 'kasse'
  | 'kasseV'
  | 'mod';

interface StaffTypeCollections {
  techniker: string[];
  technikerV: string[];
  merchandise: string[];
  kasse: string[];
  kasseV: string[];
  mod: string[];
}

export interface StaffRaw extends StaffTypeCollections {
  technikerNotNeeded: boolean;
  technikerVNotNeeded: boolean;
  kasseNotNeeded: boolean;
  kasseVNotNeeded: boolean;
  modNotNeeded: boolean;
  merchandiseNotNeeded: boolean;
}

export interface StaffUI extends StaffTypeCollections {
  technikerNotNeeded?: string;
  technikerVNotNeeded?: string;
  kasseNotNeeded?: string;
  kasseVNotNeeded?: string;
  modNotNeeded?: string;
  merchandiseNotNeeded?: string;
}

export default class Staff {
  state: StaffRaw;
  private mitarbeiterTransient!: { [p: string]: User[] };

  toJSON(): StaffRaw {
    return this.state;
  }

  constructor(object: StaffRaw | undefined) {
    this.state = object || {
      techniker: [],
      technikerV: [],
      merchandise: [],
      kasse: [],
      kasseV: [],
      mod: [],
      technikerNotNeeded: false,
      technikerVNotNeeded: false,
      kasseNotNeeded: false,
      kasseVNotNeeded: false,
      modNotNeeded: false,
      merchandiseNotNeeded: false
    };
    this.state.techniker = this.state.techniker || [];
    this.state.technikerV = this.state.technikerV || [];
    this.state.kasse = this.state.kasse || [];
    this.state.kasseV = this.state.kasseV || [];
    this.state.merchandise = this.state.merchandise || [];
    this.state.mod = this.state.mod || [];
  }

  fillFromUI(object: StaffUI): Staff {
    this.state.techniker = misc.toArray(object.techniker);
    this.state.technikerV = misc.toArray(object.technikerV);
    this.state.kasse = misc.toArray(object.kasse);
    this.state.kasseV = misc.toArray(object.kasseV);
    this.state.merchandise = misc.toArray(object.merchandise);
    this.state.mod = misc.toArray(object.mod);
    this.state.technikerNotNeeded = !object.technikerNotNeeded;
    this.state.technikerVNotNeeded = !object.technikerVNotNeeded;
    this.state.kasseNotNeeded = !object.kasseNotNeeded;
    this.state.kasseVNotNeeded = !object.kasseVNotNeeded;
    this.state.modNotNeeded = !object.modNotNeeded;
    this.state.merchandiseNotNeeded = !object.merchandiseNotNeeded;
    return this;
  }

  getStaffCollection(forType: StaffType): string[] {
    return this.state[forType];
  }

  updateStaff(object: StaffUI): void {
    this.fillFromUI(object);
  }

  noStaffNeeded(): boolean {
    return (
      this.technikerNotNeeded() &&
      this.technikerVNotNeeded() &&
      this.kasseNotNeeded() &&
      this.kasseVNotNeeded() &&
      this.merchandiseNotNeeded()
    );
  }

  mod(): string[] {
    return this.state.mod;
  }

  modNotNeeded(): boolean {
    return this.state.modNotNeeded;
  }

  techniker(): string[] {
    return this.state.techniker;
  }

  technikerV(): string[] {
    return this.state.technikerV;
  }

  technikerNotNeeded(): boolean {
    return this.state.technikerNotNeeded;
  }

  technikerVNotNeeded(): boolean {
    return this.state.technikerVNotNeeded;
  }

  merchandiseNotNeeded(): boolean {
    return this.state.merchandiseNotNeeded;
  }

  technikerAlle(): string[] {
    return R.union(this.technikerV(), this.techniker());
  }

  kasse(): string[] {
    return this.state.kasse;
  }

  kasseV(): string[] {
    return this.state.kasseV;
  }

  kasseNotNeeded(): boolean {
    return this.state.kasseNotNeeded;
  }

  kasseVNotNeeded(): boolean {
    return this.state.kasseVNotNeeded;
  }

  kasseAlle(): string[] {
    return R.union(this.kasseV(), this.kasse());
  }

  merchandise(): string[] {
    return this.state.merchandise;
  }

  technikerText(): string {
    return this.technikerAlle().length > 0
      ? this.technikerAlle().join(', ')
      : '-';
  }

  kassiererText(): string {
    return this.kasseAlle().length > 0 ? this.kasseAlle().join(', ') : '-';
  }

  tooltipInfos(): string {
    if (this.noStaffNeeded()) {
      return '';
    }
    return (
      ' Kasse: ' +
      this.kassiererText() +
      ' | Techniker: ' +
      this.technikerText()
    );
  }

  enrichUsers(users?: User[]): void {
    if (!users) {
      return;
    }
    const filledUsers: { [index: string]: User[] } = {};
    filledUsers.techniker = users.filter(u =>
      R.includes(u.id, this.state.techniker)
    );
    filledUsers.technikerV = users.filter(u =>
      R.includes(u.id, this.state.technikerV)
    );
    filledUsers.kasse = users.filter(u => R.includes(u.id, this.state.kasse));
    filledUsers.kasseV = users.filter(u => R.includes(u.id, this.state.kasseV));
    filledUsers.merchandiseV = users.filter(u =>
      R.includes(u.id, this.state.merchandise)
    );
    this.mitarbeiterTransient = filledUsers;
  }

  kasseFehlt(): boolean {
    return (
      (!this.kasseNotNeeded() && this.kasse().length === 0) ||
      (!this.kasseVNotNeeded() && this.kasseV().length === 0)
    );
  }
}
