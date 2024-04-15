import store from "./vermietungenstore.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import User from "jc-shared/user/user.js";

function getVermietung(url: string) {
  return store.getVermietung(url) ?? null;
}

/*
 * Alle unbestätigten und ohne Personal filtern
 */
function filterUnbestaetigteFuerJedermann(vermietungen: Vermietung[], user: User): Vermietung[] {
  if (user.accessrights.isBookingTeam) {
    return vermietungen;
  }
  return vermietungen.filter((v) => v.kopf.confirmed && v.brauchtPersonal);
}
export default {
  getVermietung,
  filterUnbestaetigteFuerJedermann,
};
