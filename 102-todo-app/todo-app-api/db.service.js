const mongodb = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || '';

let collection;
let mongoClient = mongodb.MongoClient;

module.exports.collectionAsync = new Promise((resolve, reject) => {
  if (MONGODB_URI !== '') {
    mongoClient.connect(MONGODB_URI, {
      autoReconnect: true,
      reconnectInterval: 10000,
      reconnectTries: Number.MAX_VALUE,
      useNewUrlParser: true
    }, function(err, db) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      console.log('connected to mongoDB');
      collection = db.db('tododb').collection('todos');
      resolve(collection);
    });
  } else {
    mongoClient = null;
    collection = require('./mock-db.service');
    resolve(collection);
  }
});