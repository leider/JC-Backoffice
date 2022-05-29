import path from "path";
import fs from "fs/promises";

import { ImageOverviewRow } from "jc-shared/veranstaltung/veranstaltung";

import store from "./veranstaltungenstore";

const uploadDir = path.join(__dirname, "../../static/upload");

async function renameImage(oldname: string, newname: string, veranstIds: string[]) {
  async function updateVeranstaltung(id: string) {
    const veranstaltung = await store.getVeranstaltungForId(id);
    veranstaltung.updateImageName(oldname, newname);
    return store.saveVeranstaltung(veranstaltung);
  }

  await fs.rename(uploadDir + "/" + oldname, uploadDir + "/" + newname);
  return Promise.all(veranstIds.map(updateVeranstaltung));
}

async function renameImages(rows: ImageOverviewRow[]) {
  async function renameRow(row: ImageOverviewRow) {
    return renameImage(
      row.image,
      row.newname,
      row.veranstaltungen.map((v) => v.id)
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
