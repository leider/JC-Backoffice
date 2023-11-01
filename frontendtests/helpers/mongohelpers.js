const mongodb = require("mongodb");
const mongoConfig = require("../../config-it/mongo-config.json");
const Helper = require("@codeceptjs/helper");
const fs = require("fs/promises");
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

  async createData(collectionName, filename) {
    console.log(`CREATE OBJECT ${filename} IN COLLECTION ${collectionName}`);
    const json = await fs.readFile(`${__dirname}/../data/${collectionName}/${filename}.json`, "utf8");
    const object = JSON.parse(json);

    const client = await mongodb.MongoClient.connect(url);
    const db = client.db();
    await db.collection(collectionName).replaceOne({ id: object.id }, object, { upsert: true });
    await client.close();
  }
}
module.exports = dbHelper;
