import "../../configure.js";

import { loadAll } from "./mongohelper.js";
import persistenceLite from "../persistence/sqlitePersistence.js";
import { WithId, Document } from "mongodb";
async function doit() {
  const collections: { name: string; res: WithId<Document>[] }[] = await loadAll();
  collections.forEach((part) => {
    // eslint-disable-next-line no-console
    console.log(part.name);
    const rows = part.res.map((row) => {
      delete (row as Omit<WithId<Document>, "_id">)._id;
      return JSON.parse(JSON.stringify(row));
    });
    if (part.name === "veranstaltungenstore" || part.name === "vermietungenstore") {
      persistenceLite(part.name, ["startDate", "endDate", "url"]).saveAll(rows);
    } else if (part.name === "terminstore") {
      persistenceLite(part.name, ["startDate", "endDate"]).saveAll(rows);
    } else {
      persistenceLite(part.name).saveAll(rows);
    }
  });
}

doit();
