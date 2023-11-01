const mongodb = require("mongodb");
const mongoConfig = require("../../config-it/mongo-config.json");
const Helper = require("@codeceptjs/helper");
const url = mongoConfig.mongoURL;

class dbHelper extends Helper {
  async dropAllCollections() {
    console.log("DROP");
    const client = await mongodb.MongoClient.connect(url);
    const db = client.db();
    const collections = await db.collections();
    await Promise.all(collections.map((coll) => coll.drop()));
    await client.close();
  }

  async deleteObjectInCollection(id, collectionName) {
    console.log(`DELETE OBJECT ${id} IN COLLECTION ${collectionName}`);
    const client = await mongodb.MongoClient.connect(url);
    const db = client.db();
    await db.collection(collectionName).deleteOne(
      { id },
      {
        writeConcern: { w: 1 },
      },
    );
    await client.close();
  }
}
module.exports = dbHelper;
