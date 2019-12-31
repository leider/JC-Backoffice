import { genSalt, hashPassword } from '../commons/hashPassword';

export default class User {
  id: string;
  name!: string;
  email!: string;
  tel!: string;
  hashedPassword: string;
  salt: string;
  tshirt!: string;

  gruppen: string[];
  rechte!: string[];
  password!: string; // transient

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

    if (object.password) {
      this.updatePassword(object.password);
    }
  }

  updatePassword(newPass: string): void {
    this.salt = genSalt();
    this.hashedPassword = hashPassword(newPass, this.salt);
  }

  get asGitAuthor(): string {
    return `${this.name} <${this.email}>`;
  }
}
