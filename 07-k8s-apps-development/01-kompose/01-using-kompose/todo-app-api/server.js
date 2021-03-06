const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

try {
  const dotenv = require('dotenv');
  if (dotenv) {
    dotenv.config();
  }
} catch (err) {
  console.warn(err);
  console.log(`NODE ENV ${process.env.NODE_ENV}, dotenv not init`);
}



const { collectionAsync } = require('./db.service');

app.use(cors());
app.use(bodyParser.json());

(async () => {
  const collection = await collectionAsync;
  app.get('/todos', (req, res) => {
    console.log('Todos API GET');
    collection.find().sort({ _id: -1 }).toArray((err, todos) => {
      res.send(todos);
    });
  });

  const mapResult = (result) => {
    if (result['ops'] && result['ops'].length > 0) {
      return result['ops'][0];
    }
    return result;
  };

  app.post('/todos', (req, res) => {
    console.log(req.body);
    if (!req.body) {
      res.statusCode(400);
      return res.send('Post syntax incorrect');
    }

    const todo = req.body;
    collection.insertOne(todo, (err, todo) => {
      if (err) {
        console.log(err);
      }

      res.send(mapResult(todo));
    });
  });

  app.listen(3000, () => {
    console.log('Todos API lsiten on port 3000');
  });
})();
