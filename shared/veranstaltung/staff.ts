import User from "../user/user.js";

export type StaffType = "techniker" | "technikerV" | "merchandise" | "kasse" | "kasseV" | "mod";

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

  toJSON(): object {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
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

  getStaffCollection(forType: StaffType): string[] {
    return this[forType];
  }

  setStaffCollection(forType: StaffType, value: string[]): void {
    this[forType] = value;
  }

  getStaffNotNeeded(forType: StaffType): boolean {
    switch (forType) {
      case "kasse":
        return this.kasseNotNeeded;
      case "kasseV":
        return this.kasseVNotNeeded;
      case "merchandise":
        return this.merchandiseNotNeeded;
      case "mod":
        return this.modNotNeeded;
      case "techniker":
        return this.technikerNotNeeded;
      case "technikerV":
        return this.technikerVNotNeeded;
    }
  }

  setStaffNotNeeded(forType: StaffType, check: boolean): void {
    switch (forType) {
      case "kasse":
        this.kasseNotNeeded = check;
        break;
      case "kasseV":
        this.kasseVNotNeeded = check;
        break;
      case "merchandise":
        this.merchandiseNotNeeded = check;
        break;
      case "mod":
        this.modNotNeeded = check;
        break;
      case "techniker":
        this.technikerNotNeeded = check;
        break;
      case "technikerV":
        this.technikerVNotNeeded = check;
        break;
    }
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
