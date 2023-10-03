import store from "./vermietungenstore.js";

async function getVermietung(url: string) {
  const vermietung = await store.getVermietung(url);
  if (!vermietung) {
    return null;
  }
  return vermietung;
}

export default {
  getVermietung,
};
