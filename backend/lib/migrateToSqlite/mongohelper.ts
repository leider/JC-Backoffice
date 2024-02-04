import { MongoClient, Collection } from "mongodb";

const url = "mongodb://0.0.0.0:27017/jazzclub";

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
