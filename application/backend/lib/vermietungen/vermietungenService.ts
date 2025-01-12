import Vermietung from "jc-shared/vermietung/vermietung.js";
import User from "jc-shared/user/user.js";
import filter from "lodash/filter.js";

/*
 * Alle unbestätigten und ohne Personal filtern
 */
export function filterUnbestaetigteFuerJedermann(vermietungen: Vermietung[], user: User): Vermietung[] {
  if (user.accessrights.isBookingTeam) {
    return vermietungen;
  }
  return filter(vermietungen, { kopf: { confirmed: true }, brauchtPersonal: true }); //  (v) => v.kopf.confirmed && v.brauchtPersonal
}
