import User from "../user/user.js";
import Veranstaltung from "../veranstaltung/veranstaltung.js";
import find from "lodash/find.js";
import map from "lodash/map.js";
import compact from "lodash/compact.js";

export type VerMitUser = { veranstaltung: Veranstaltung; user: User };

export default function mixVeranstaltungenMitUsers(veranstaltungen: Veranstaltung[], users: User[]): VerMitUser[] {
  return veranstaltungen.flatMap((veranstaltung) => {
    const existingUsers = compact(map(veranstaltung.staff.allNames, (id) => find(users, { id })));
    return map(existingUsers, (user) => ({ veranstaltung, user }));
  });
}
