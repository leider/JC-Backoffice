import uniq from "lodash/uniq";
import flatten from "lodash/flatten";

import misc from "../commons/misc";
import User from "./user";

export class Mailingliste {
  name: string;
  users: User[];

  constructor(name: string, usersInListe: User[]) {
    this.name = name;
    this.users = usersInListe;
  }
}

class Users {
  users: User[];

  constructor(users: User[]) {
    this.users = users;
  }

  filterReceivers(groupsFromBody: string[] | undefined, userFromBody: string[] | undefined, listenFromBody: string[] | undefined): User[] {
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
              .concat("superusers")
              .map((group) => this.users.filter((user) => user.gruppen.includes(group)))
          )
        )
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

  get mailinglisten() {
    return this.extractListen().map((name) => new Mailingliste(name, this.getUsersInListe(name)));
  }
}
export default Users;
