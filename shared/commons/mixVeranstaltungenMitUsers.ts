import Veranstaltung from "../veranstaltung/veranstaltung.js";
import User from "../user/user.js";
import Vermietung from "../vermietung/vermietung.js";

export type VerMitUser = { veranstaltung: Veranstaltung | Vermietung; user: User };

export default function mixVeranstaltungenMitUsers(veranstaltungen: (Veranstaltung | Vermietung)[], users: User[]): VerMitUser[] {
  return veranstaltungen.flatMap((veranstaltung) => {
    return veranstaltung.staff.allNames
      .map((id) => users.find((user) => user.id === id))
      .filter((user) => !!user)
      .map((user) => ({
        veranstaltung,
        user: user || new User({}),
      }));
  });
}
