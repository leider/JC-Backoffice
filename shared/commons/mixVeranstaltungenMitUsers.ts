import Konzert from "../konzert/konzert.js";
import User from "../user/user.js";
import Vermietung from "../vermietung/vermietung.js";
import Staff from "../veranstaltung/staff.js";

export type VerMitUser = { veranstaltung: Konzert | Vermietung; user: User };

export default function mixVeranstaltungenMitUsers(veranstaltungen: (Konzert | Vermietung)[], users: User[]): VerMitUser[] {
  return veranstaltungen.flatMap((veranstaltung) => {
    return (veranstaltung.staff as Staff).allNames
      .map((id) => users.find((user) => user.id === id))
      .filter((user) => !!user)
      .map((user) => ({
        veranstaltung,
        user: user || new User({}),
      }));
  });
}
