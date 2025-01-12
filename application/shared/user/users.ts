import User, { ABENDKASSE, BOOKING, KannSection, ORGA, SUPERUSERS } from "./user.js";
import misc from "../commons/misc.js";
import uniq from "lodash/uniq.js";
import map from "lodash/map.js";
import filter from "lodash/filter.js";
import flatMap from "lodash/flatMap.js";
import intersection from "lodash/intersection.js";

export class Mailingliste {
  name: string;
  users: string[];

  constructor(name: string, usersInListe: User[]) {
    this.name = name;
    this.users = map(usersInListe, "id");
  }
}

class Users {
  users: User[] = [];

  constructor(users: User[]) {
    this.users = users;
  }

  filterReceivers(groupsFromBody?: string[], userFromBody?: string[], listenFromBody?: string[]): User[] {
    let result: User[] = [];
    if (groupsFromBody && groupsFromBody.length) {
      if (misc.toArray(groupsFromBody).includes("alle")) {
        return this.users;
      }
      result = result.concat(
        uniq(
          flatMap(misc.toArray(groupsFromBody).concat(SUPERUSERS), (group) => filter(this.users, (user) => user.gruppen.includes(group))),
        ),
      );
    }
    if (listenFromBody && listenFromBody.length) {
      result = result.concat(uniq(flatMap(misc.toArray(listenFromBody), (liste) => this.getUsersInListe(liste))));
    }
    return uniq(result.concat(filter(this.users, (user) => (userFromBody || []).includes(user.id))));
  }

  extractListen() {
    return uniq(flatMap(this.users, (u) => u.mailinglisten));
  }

  getUsersInListe(listenname: string) {
    return filter(this.users, (u) => u.mailinglisten.includes(listenname));
  }

  getUsersInGruppenExact(gruppennamen: (typeof SUPERUSERS | typeof ORGA | typeof BOOKING | typeof ABENDKASSE)[]) {
    return filter(this.users, (user) => !!intersection(gruppennamen, user.gruppen).length);
  }

  getUsersKann(kann: KannSection) {
    return filter(this.users, (u) => u.kann(kann));
  }

  getUsersKannOneOf(kannMultiple: KannSection[]) {
    return filter(this.users, (user) => filter(kannMultiple, (kann) => user.kann(kann)).length > 0);
  }

  get mailinglisten(): Mailingliste[] {
    return map(this.extractListen(), (name) => new Mailingliste(name, this.getUsersInListe(name)));
  }
}
export default Users;
