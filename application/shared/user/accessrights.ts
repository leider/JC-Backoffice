import User, { ABENDKASSE, BOOKING, ORGA, SUPERUSERS } from "./user.js";

export default class Accessrights {
  private user?: User;

  constructor(user?: User) {
    this.user = user;
  }

  get member(): User | undefined {
    return this.user;
  }

  get memberId(): string {
    return this.member?.id || "";
  }

  get gruppen(): string[] {
    return this.member?.gruppen || [];
  }

  get rechte(): string[] {
    return this.member?.rechte || [];
  }

  get isSuperuser(): boolean {
    return this.gruppen.includes(SUPERUSERS);
  }

  get isBookingTeam(): boolean {
    return this.isSuperuser || this.gruppen.includes(BOOKING);
  }

  get isOrgaTeam(): boolean {
    return this.isBookingTeam || this.gruppen.includes(ORGA);
  }

  get isAbendkasse(): boolean {
    return this.isOrgaTeam || this.gruppen.includes(ABENDKASSE);
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
