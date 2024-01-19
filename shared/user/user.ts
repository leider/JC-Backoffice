import Accessrights from "./accessrights.js";

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

  get accessrights(): Accessrights {
    if (!this.accessrightsTransient) {
      this.accessrightsTransient = new Accessrights(this);
    }
    return this.accessrightsTransient;
  }
}
