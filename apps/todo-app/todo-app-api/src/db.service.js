import { MongoClient } from "mongodb";
import { collection as mockCollection } from "./mock-db.service.js";
import config from "./config.js";

const MONGODB_URI = config.connectionString;

export const collectionAsync = async () => {
  if (MONGODB_URI !== "") {
    console.log("MONGODB_URI", MONGODB_URI);
    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect(MONGODB_URI);
      console.log("Connected to database");
      return client.db("tododb").collection("todos");
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log("db.service mock invoke");
    return mockCollection;
  }
};
