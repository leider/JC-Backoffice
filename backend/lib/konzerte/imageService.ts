import User from "jc-shared/user/user.js";

import path from "path";
import fs from "fs/promises";
import { ImageOverviewRow } from "jc-shared/konzert/konzert.js";
import store from "./konzertestore.js";
import conf from "jc-shared/commons/simpleConfigure.js";

const additionalstatic = conf.getString("additionalstatic");
const uploadDir = path.join(additionalstatic, "upload");

async function renameImage(oldname: string, newname: string, konzertIds: string[], user: User) {
  function updateKonzert(id: string) {
    const konzert = store.getKonzertForId(id);
    if (!konzert) {
      return;
    }
    konzert.updateImageName(oldname, newname);
    return store.saveKonzert(konzert, user);
  }

  await fs.rename(uploadDir + "/" + oldname, uploadDir + "/" + newname);
  return Promise.all(konzertIds.map(updateKonzert));
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
