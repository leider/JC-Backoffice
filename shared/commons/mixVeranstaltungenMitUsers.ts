import Veranstaltung from "../veranstaltung/veranstaltung";
import User from "../user/user";

export type VerMitUser = { veranstaltung: Veranstaltung; user: User };

export default function mixVeranstaltungenMitUsers(veranstaltungen: Veranstaltung[], users: User[]): VerMitUser[] {
  return veranstaltungen.flatMap((veranstaltung) => {
    return veranstaltung.staff.allNames
      .map((id) => users.find((user) => user.id === id))
      .filter((user) => !!user)
      .map((user) => ({
        veranstaltung,
        user: user!,
      }));
  });
}