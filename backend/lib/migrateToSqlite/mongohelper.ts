import { MongoClient, Collection } from "mongodb";
import conf from "../../../shared/commons/simpleConfigure.js";
const url = conf.get("mongoURL") as string;

export async function loadAll() {
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
