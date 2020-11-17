import User from "./user";

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
    return this.gruppen.includes("superusers");
  }

  get isBookingTeam(): boolean {
    return this.isSuperuser || this.gruppen.includes("bookingTeam");
  }

  get isOrgaTeam(): boolean {
    return this.isBookingTeam || this.gruppen.includes("orgaTeam");
  }

  get isAbendkasse(): boolean {
    return this.isOrgaTeam || this.gruppen.includes("abendkasse");
  }

  get darfKasseFreigeben(): boolean {
    return this.isSuperuser || this.rechte.includes("kassenfreigabe");
  }

  canEditUser(userid: string): boolean {
    return this.isSuperuser || this.memberId === userid;
  }
}
