import Accessrights from "./accessrights.js";
import isNil from "lodash/isNil.js";

export type KannSection = "Kasse" | "Ton" | "Licht" | "Master" | "Ersthelfer";

export const SUPERUSERS = "superusers";
export const BOOKING = "bookingTeam";
export const ORGA = "orgaTeam";
export const ABENDKASSE = "abendkasse";

export const userGruppen = [SUPERUSERS, BOOKING, ORGA, ABENDKASSE];

export default class User {
  id: string;
  name!: string;
  email!: string;
  tel!: string;
  hashedPassword?: string;
  salt?: string;
  tshirt!: string;

  gruppen: string[] = [];
  rechte: string[] = [];
  kassenfreigabe = false;
  mailinglisten: string[] = [];
  wantsEmailReminders?: boolean;
  password?: string; // take care to not persist!
  accessrightsTransient?: Accessrights; // transient

  kannKasse?: boolean;
  kannTon?: boolean;
  kannLicht?: boolean;
  kannMaster?: boolean;
  kannErsthelfer?: boolean;

  constructor(object: Partial<User>) {
    delete this.accessrightsTransient;
    this.id = object.id!;
    Object.assign(this, object, {
      kassenfreigabe: object.kassenfreigabe || object.rechte?.includes("kassenfreigabe"),
    });
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    const result = Object.assign({}, this);
    delete result.accessrightsTransient;
    return result;
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSONWithoutPass(): any {
    const result = this.toJSON();
    delete result.hashedPassword;
    delete result.salt;
    return result;
  }

  get asGitAuthor(): string {
    return `${this.name} <${this.email}>`;
  }

  subscribeList(listname: string): void {
    this.mailinglisten.push(listname);
  }

  get hatKeineKannsGefuellt(): boolean {
    return isNil(this.kannKasse) && isNil(this.kannTon) && isNil(this.kannLicht) && isNil(this.kannMaster);
  }

  get kannSections(): KannSection[] {
    const result: KannSection[] = [];
    if (this.kannKasse) {
      result.push("Kasse");
    }
    if (this.kannTon) {
      result.push("Ton");
    }
    if (this.kannLicht) {
      result.push("Licht");
    }
    if (this.kannMaster) {
      result.push("Master");
    }
    if (this.kannErsthelfer) {
      result.push("Ersthelfer");
    }
    return result;
  }

  kann(kann: KannSection) {
    switch (kann) {
      case "Kasse":
        return !!this.kannKasse;
      case "Licht":
        return !!this.kannLicht;
      case "Ton":
        return !!this.kannTon;
      case "Master":
        return !!this.kannMaster;
      case "Ersthelfer":
        return !!this.kannErsthelfer;
    }
  }

  get accessrights(): Accessrights {
    if (!this.accessrightsTransient) {
      this.accessrightsTransient = new Accessrights(this);
    }
    return this.accessrightsTransient;
  }
}
