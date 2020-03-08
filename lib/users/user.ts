import Accessrights from "../commons/accessrights";

export default class User {
  id: string;
  name!: string;
  email!: string;
  tel!: string;
  hashedPassword!: string;
  salt!: string;
  tshirt!: string;

  gruppen: string[];
  rechte: string[];
  mailinglisten: string[];
  password!: string; // transient
  accessrights!: Accessrights; // transient

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object: any) {
    this.id = object.id;
    this.name = object.name;
    this.email = object.email;
    this.tel = object.tel;
    this.hashedPassword = object.hashedPassword;
    this.salt = object.salt;
    this.tshirt = object.tshirt;

    this.gruppen = object.gruppen || [];
    this.rechte = object.rechte || [];

    this.mailinglisten = object.mailinglisten || [];
  }

  toJSON() {
    const result = Object.assign({}, this);
    delete result.password;
    delete result.accessrights;
    return result;
  }

  get asGitAuthor(): string {
    return `${this.name} <${this.email}>`;
  }

  unsubscribeFromList(oldlistname: string | undefined) {
    if (oldlistname) {
      this.mailinglisten = this.mailinglisten.filter(name => name !== oldlistname);
    }
  }

  subscribeList(listname: string) {
    this.mailinglisten.push(listname);
  }
}
