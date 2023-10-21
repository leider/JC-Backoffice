import store from "./vermietungenstore.js";
import User from "jc-shared/user/user";
import Vermietung from "jc-shared/vermietung/vermietung";

async function getVermietung(url: string) {
  const vermietung = await store.getVermietung(url);
  if (!vermietung) {
    return null;
  }
  return vermietung;
}

function filterUnbestaetigteFuerJedermann(vermietungen: Vermietung[], user?: User): Vermietung[] {
  if (user?.accessrights?.isBookingTeam) {
    return vermietungen;
  }
  return vermietungen.filter((v) => v.confirmed);
}

export default {
  getVermietung,
  filterUnbestaetigteFuerJedermann,
};
