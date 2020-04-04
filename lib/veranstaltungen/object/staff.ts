import misc from "../../commons/misc";
import R from "ramda";
import User from "../../users/user";

export type StaffType = "techniker" | "technikerV" | "merchandise" | "kasse" | "kasseV" | "mod";

export interface StaffUI {
  techniker: string[];
  technikerV: string[];
  merchandise: string[];
  kasse: string[];
  kasseV: string[];
  mod: string[];
  technikerNotNeeded?: string;
  technikerVNotNeeded?: string;
  kasseNotNeeded?: string;
  kasseVNotNeeded?: string;
  modNotNeeded?: string;
  merchandiseNotNeeded?: string;
}

export default class Staff {
  techniker: string[] = [];
  technikerV: string[] = [];
  merchandise: string[] = [];
  kasse: string[] = [];
  kasseV: string[] = [];
  mod: string[] = [];
  technikerNotNeeded = false;
  technikerVNotNeeded = false;
  kasseNotNeeded = false;
  kasseVNotNeeded = false;
  modNotNeeded = false;
  merchandiseNotNeeded = false;
  mitarbeiterTransient?: { [p: string]: User[] };

  toJSON(): any {
    const result = Object.assign({}, this);
    delete result.mitarbeiterTransient;
    return result;
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        techniker: object.techniker || [],
        technikerV: object.technikerV || [],
        kasse: object.kasse || [],
        kasseV: object.kasseV || [],
        merchandise: object.merchandise || [],
        mod: object.mod || [],
      });
    }
  }

  fillFromUI(object: StaffUI): Staff {
    this.techniker = misc.toArray(object.techniker);
    this.technikerV = misc.toArray(object.technikerV);
    this.kasse = misc.toArray(object.kasse);
    this.kasseV = misc.toArray(object.kasseV);
    this.merchandise = misc.toArray(object.merchandise);
    this.mod = misc.toArray(object.mod);
    this.technikerNotNeeded = !object.technikerNotNeeded;
    this.technikerVNotNeeded = !object.technikerVNotNeeded;
    this.kasseNotNeeded = !object.kasseNotNeeded;
    this.kasseVNotNeeded = !object.kasseVNotNeeded;
    this.modNotNeeded = !object.modNotNeeded;
    this.merchandiseNotNeeded = !object.merchandiseNotNeeded;
    return this;
  }

  getStaffCollection(forType: StaffType): string[] {
    return this[forType];
  }

  updateStaff(object: StaffUI): void {
    this.fillFromUI(object);
  }

  noStaffNeeded(): boolean {
    return this.technikerNotNeeded && this.technikerVNotNeeded && this.kasseNotNeeded && this.kasseVNotNeeded && this.merchandiseNotNeeded;
  }

  technikerAlle(): string[] {
    return R.union(this.technikerV, this.techniker);
  }

  kasseAlle(): string[] {
    return R.union(this.kasseV, this.kasse);
  }

  technikerText(): string {
    return this.technikerAlle().length > 0 ? this.technikerAlle().join(", ") : "-";
  }

  kassiererText(): string {
    return this.kasseAlle().length > 0 ? this.kasseAlle().join(", ") : "-";
  }

  tooltipInfos(): string {
    if (this.noStaffNeeded()) {
      return "";
    }
    return " Kasse: " + this.kassiererText() + " | Techniker: " + this.technikerText();
  }

  enrichUsers(users?: User[]): void {
    if (!users) {
      return;
    }
    const filledUsers: { [index: string]: User[] } = {};
    filledUsers.techniker = users.filter((u) => R.includes(u.id, this.techniker));
    filledUsers.technikerV = users.filter((u) => R.includes(u.id, this.technikerV));
    filledUsers.kasse = users.filter((u) => R.includes(u.id, this.kasse));
    filledUsers.kasseV = users.filter((u) => R.includes(u.id, this.kasseV));
    filledUsers.merchandise = users.filter((u) => R.includes(u.id, this.merchandise));
    filledUsers.mod = users.filter((u) => R.includes(u.id, this.mod));
    this.mitarbeiterTransient = filledUsers;
  }

  kasseFehlt(): boolean {
    return (!this.kasseNotNeeded && this.kasse.length === 0) || (!this.kasseVNotNeeded && this.kasseV.length === 0);
  }

  addUserToSection(user: User, section: StaffType) {
    this.getStaffCollection(section).push(user.id);
  }

  removeUserFromSection(user: User, section: StaffType) {
    const sec = this.getStaffCollection(section);
    const index = sec.indexOf(user.id);
    sec.splice(index, 1);
  }
}
