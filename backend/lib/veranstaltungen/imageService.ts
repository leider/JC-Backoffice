import User from "jc-shared/user/user.js";

const __dirname = new URL(".", import.meta.url).pathname;
import path from "path";
import fs from "fs/promises";

import { ImageOverviewRow } from "jc-shared/veranstaltung/veranstaltung.js";

import store from "./veranstaltungenstore.js";

const uploadDir = path.join(__dirname, "../../static/upload");

async function renameImage(oldname: string, newname: string, veranstIds: string[], user: User) {
  function updateVeranstaltung(id: string) {
    const veranstaltung = store.getVeranstaltungForId(id);
    if (!veranstaltung) {
      return;
    }
    veranstaltung.updateImageName(oldname, newname);
    return store.saveVeranstaltung(veranstaltung, user);
  }

  await fs.rename(uploadDir + "/" + oldname, uploadDir + "/" + newname);
  return Promise.all(veranstIds.map(updateVeranstaltung));
}

function renameImages(rows: ImageOverviewRow[], user: User) {
  function renameRow(row: ImageOverviewRow) {
    return renameImage(
      row.image,
      row.newname,
      row.veranstaltungen.map((v) => v.id),
      user,
    );
  }
  return Promise.all(rows.map(renameRow));
}

export default {
  renameImages,

  alleBildNamen: async function alleBildNamen() {
    const files = await fs.readdir(uploadDir);
    return files.sort();
  },
};
