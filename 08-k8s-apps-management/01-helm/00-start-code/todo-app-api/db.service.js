import { MongoClient } from "mongodb";
import { collection as mockCollection } from "./mock-db.service.js";
import config from "./config.js";

const MONGODB_URI = config.connectionString;

export const collectionAsync = async () => {
  if (MONGODB_URI !== "") {
    const client = new MongoClient(MONGODB_URI);
    await client.connect(MONGODB_URI);
    return client.db("tododb").collection("todos");
  } else {
    mongoClient = null;
    console.log("db.service mock invoke");
    resolve(mockCollection);
    return mockCollection;
  }
};
