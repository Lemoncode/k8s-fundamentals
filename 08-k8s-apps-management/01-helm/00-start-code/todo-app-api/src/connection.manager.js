import { MongoClient } from "mongodb";
import config from "./config.js";

const MONGODB_URI = config.connectionString;

const delay = (offset = 10000) => new Promise((res) => {});

class ConnectionManager {
  constructor(uri) {
    this.connection = null;
    this.client = new MongoClient(uri);
  }

  async connect() {
    try {
      this.connection = await this.client.connect();
      // TODO: Dispatch event
      return;
    } catch (e) {
      console.log(e);
      await delay();
      this.connect();
    }
  }

  async getConnection() {
    return this.connection;
  }
}

export default new ConnectionManager(MONGODB_URI);
