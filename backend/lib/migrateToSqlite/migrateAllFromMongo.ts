import "../../configure.js";

import persistenceLite from "../persistence/sqlitePersistence.js";
import { WithId, Document, MongoClient, Collection } from "mongodb";
import conf from "../../../shared/commons/simpleConfigure.js";
const url = conf.get("mongoURL") as string;

async function loadAll() {
  const client = await MongoClient.connect(url);
  const db = client.db();
  const collections = await db.collections();
  const finders = collections.map(async (coll: Collection) => {
    return {
      name: coll.collectionName,
      res: await db.collection(coll.collectionName).find().toArray(),
    };
  });
  const result = await Promise.all(finders);
  client.close();
  return result;
}

export async function migrateFromMongo() {
  if (persistenceLite("optionenstore").getById("instance").id || !url) {
    // eslint-disable-next-line no-console
    console.log("DB already migrated");
    return;
  }
  const collections: { name: string; res: WithId<Document>[] }[] = await loadAll();
  collections.forEach((part) => {
    // eslint-disable-next-line no-console
    console.log(`Migrating: ${part.name}`);
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
