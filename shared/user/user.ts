import Accessrights from "./accessrights.js";
import isNil from "lodash/isNil.js";

export type KannSection = "Kasse" | "Ton" | "Licht" | "Master";

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

  gruppen: string[];
  rechte: string[];
  kassenfreigabe = false;
  mailinglisten: string[];
  wantsEmailReminders?: boolean;
  password?: string; // take care to not persist!
  accessrightsTransient?: Accessrights; // transient

  kannKasse?: boolean;
  kannTon?: boolean;
  kannLicht?: boolean;
  kannMaster?: boolean;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  constructor(object: any) {
    this.id = object.id;
    this.name = object.name;
    this.email = object.email;
    this.tel = object.tel;
    this.hashedPassword = object.hashedPassword;
    this.salt = object.salt;
    this.tshirt = object.tshirt;
    this.password = object.password;
    this.wantsEmailReminders = object.wantsEmailReminders;

    this.kannKasse = object.kannKasse;
    this.kannTon = object.kannTon;
    this.kannLicht = object.kannLicht;
    this.kannMaster = object.kannMaster;

    this.gruppen = object.gruppen || [];
    this.rechte = object.rechte || [];
    this.kassenfreigabe = object.kassenfreigabe || this.rechte.includes("kassenfreigabe");

    this.mailinglisten = object.mailinglisten || [];
    this.accessrightsTransient = undefined;
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

  unsubscribeFromList(oldlistname: string | undefined): void {
    if (oldlistname) {
      this.mailinglisten = this.mailinglisten.filter((name) => name !== oldlistname);
    }
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
    return result;
  }

  get accessrights(): Accessrights {
    if (!this.accessrightsTransient) {
      this.accessrightsTransient = new Accessrights(this);
    }
    return this.accessrightsTransient;
  }
}
