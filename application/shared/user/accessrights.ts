import User, { ABENDKASSE, BOOKING, ORGA, SUPERUSERS } from "./user.js";

export default class Accessrights {
  private user: User;

  constructor(user?: User) {
    this.user = user ?? new User({});
  }

  get member(): User {
    return this.user;
  }

  get memberId(): string {
    return this.member.id || "";
  }

  get gruppen(): typeof SUPERUSERS | typeof ORGA | typeof BOOKING | typeof ABENDKASSE | "" {
    return this.member.gruppen ?? "";
  }

  get rechte(): string[] {
    return this.member.rechte;
  }

  get isSuperuser(): boolean {
    return this.gruppen === SUPERUSERS;
  }

  get isBookingTeam(): boolean {
    return this.isSuperuser || this.gruppen === BOOKING;
  }

  get isOrgaTeam(): boolean {
    return this.isBookingTeam || this.gruppen === ORGA;
  }

  get isAbendkasse(): boolean {
    return this.isOrgaTeam || this.gruppen === ABENDKASSE;
  }

  get darfKasseFreigeben(): boolean {
    return this.isSuperuser || this.rechte.includes("kassenfreigabe");
  }

  // eslint-disable-next-line lodash/prefer-constant
  get everybody(): boolean {
    return true;
  }

  canEditUser(userid: string): boolean {
    return this.isSuperuser || this.memberId === userid;
  }
}
