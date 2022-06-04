import Accessrights from "./accessrights";

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
  accessrights?: Accessrights; // transient

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

    this.gruppen = object.gruppen || [];
    this.rechte = object.rechte || [];

    this.mailinglisten = object.mailinglisten || [];
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    const result = Object.assign({}, this);
    delete result.accessrights;
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
}
