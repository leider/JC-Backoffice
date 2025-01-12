import User from "../user/user.js";
import Veranstaltung from "../veranstaltung/veranstaltung.js";
import find from "lodash/find.js";
import map from "lodash/map.js";

export type VerMitUser = { veranstaltung: Veranstaltung; user: User };

export default function mixVeranstaltungenMitUsers(veranstaltungen: Veranstaltung[], users: User[]): VerMitUser[] {
  return veranstaltungen.flatMap((veranstaltung) => {
    const existingUsers = map(veranstaltung.staff.allNames, (id) => find(users, { id: id })).filter((user) => user);
    return map(existingUsers, (user) => ({ veranstaltung, user: user || new User({}) }));
  });
}
