const mongodb = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || '';

let collection;
let mongoClient = mongodb.MongoClient;

if (MONGODB_URI !== '') {
  mongoClient.connect(MONGODB_URI, {
    autoReconnect: true,
    reconnectInterval: 10000,
    reconnectTries: Number.MAX_VALUE,
    useNewUrlParser: true
  }, function(err, cb) {
    if (err) {
      throw err;
    }
    console.log('connected to mongoDB');
    collection = db.db('tododb').collection('todos');
  });
} else {
  mongoClient = null;
  collection = require('./mock-db.service');
}



module.exports.collection = collection;