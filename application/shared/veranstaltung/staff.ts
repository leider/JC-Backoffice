import User from "../user/user.js";
import { RecursivePartial } from "../commons/advancedTypes.js";

export type StaffType = "techniker" | "technikerV" | "merchandise" | "kasse" | "kasseV" | "mod" | "ersthelfer";

export default class Staff {
  techniker: string[] = [];
  technikerV: string[] = [];
  merchandise: string[] = [];
  kasse: string[] = [];
  kasseV: string[] = [];
  mod: string[] = [];
  ersthelfer: string[] = [];
  technikerNotNeeded = true;
  technikerVNotNeeded = true;
  kasseNotNeeded = true;
  kasseVNotNeeded = true;
  modNotNeeded = true;
  merchandiseNotNeeded = true;
  ersthelferNotNeeded = false;

  toJSON(): object {
    return Object.assign({}, this);
  }

  constructor(object?: RecursivePartial<Staff>) {
    if (object && Object.keys(object).length) {
      Object.assign(this, object, {
        techniker: object.techniker || [],
        technikerV: object.technikerV || [],
        kasse: object.kasse || [],
        kasseV: object.kasseV || [],
        merchandise: object.merchandise || [],
        mod: object.mod || [],
        ersthelfer: object.ersthelfer || [],
      });
    }
  }

  getStaffCollection(forType: StaffType): string[] {
    return this[forType];
  }

  get noStaffNeeded(): boolean {
    return this.technikerNotNeeded && this.technikerVNotNeeded && this.kasseNotNeeded && this.kasseVNotNeeded && this.merchandiseNotNeeded;
  }

  get tooltipInfos(): string {
    if (this.noStaffNeeded) {
      return "";
    }
    const kasseAlle = this.kasseV.concat(this.kasse);
    const kassiererText = kasseAlle.length > 0 ? kasseAlle.join(", ") : "-";
    const technikerAlle = this.technikerV.concat(this.techniker);
    const technikerText = technikerAlle.length > 0 ? technikerAlle.join(", ") : "-";

    return " Kasse: " + kassiererText + " | Techniker: " + technikerText;
  }

  get kasseFehlt(): boolean {
    return (!this.kasseNotNeeded && this.kasse.length === 0) || (!this.kasseVNotNeeded && this.kasseV.length === 0);
  }

  addUserToSection(user: User, section: StaffType): void {
    this.getStaffCollection(section).push(user.id);
  }

  removeUserFromSection(user: User, section: StaffType): void {
    const sec = this.getStaffCollection(section);
    const index = sec.indexOf(user.id);
    sec.splice(index, 1);
  }

  get allNames() {
    return this.kasseV
      .concat(this.kasse)
      .concat(this.technikerV)
      .concat(this.techniker)
      .concat(this.mod)
      .filter((s) => !!s);
  }
}
