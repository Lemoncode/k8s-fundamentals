import { MongoClient, Db } from 'mongodb';
import config from '../config';

const { user, port, password, host, dbName } = config.mongo;

let db: Db;
const uri = `mongodb://${user}:${password}@${host}:${port}`;
console.log(uri);
const mongoClient = new MongoClient(uri);

export const getDalClient = async () => {
  if (!db) {
    try {
      await mongoClient.connect();
      db = mongoClient.db(dbName);
    } catch (e) {
      console.error(e);
    }
  }

  return db;
};

export const closeDalClient = async () => {
  if (mongoClient) {
    await mongoClient.close();
  }
};