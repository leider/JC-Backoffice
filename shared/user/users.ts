import User, { SUPERUSERS } from "./user.js";
import misc from "../commons/misc.js";
import flatten from "lodash/flatten.js";
import uniq from "lodash/uniq.js";

export class Mailingliste {
  name: string;
  users: string[];

  constructor(name: string, usersInListe: User[]) {
    this.name = name;
    this.users = usersInListe.map((u) => u.id);
  }
}

class Users {
  users: User[];

  constructor(users: User[]) {
    this.users = users;
  }

  filterReceivers(groupsFromBody?: string[], userFromBody?: string[], listenFromBody?: string[]): User[] {
    let result: User[] = [];
    if (groupsFromBody && groupsFromBody.length > 0) {
      if (misc.toArray(groupsFromBody).includes("alle")) {
        return this.users;
      }
      result = result.concat(
        uniq(
          flatten(
            misc
              .toArray(groupsFromBody)
              .concat(SUPERUSERS)
              .map((group) => this.users.filter((user) => user.gruppen.includes(group))),
          ),
        ),
      );
    }
    if (listenFromBody && listenFromBody.length > 0) {
      result = result.concat(uniq(flatten(misc.toArray(listenFromBody).map((liste) => this.getUsersInListe(liste)))));
    }
    return uniq(result.concat(this.users.filter((user) => (userFromBody || []).includes(user.id))));
  }

  extractListen() {
    return uniq(flatten(this.users.map((u) => u.mailinglisten)));
  }

  getUsersInListe(listenname: string) {
    return this.users.filter((u) => u.mailinglisten.includes(listenname));
  }

  get mailinglisten(): Mailingliste[] {
    return this.extractListen().map((name) => new Mailingliste(name, this.getUsersInListe(name)));
  }
}
export default Users;
