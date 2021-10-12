const express = require('express');
const cors = require('cors');
const app = express();

const { collection } = require('./db.service');


app.use(cors());

app.get('/todos', (req, res) => {
  console.log('Todos API GET');
  collection.find().sort({ _id: -1 }).toArray((err, todos) => {
    res.send(todos);
  });
});

app.post('/todos', (req, res) => {
  if (!req.body) {
    res.statusCode(400);
    return res.send('Post syntax incorrect');
  }

  const todo = req.body;
  collection.insert(todo, (err, todo) => {
    if (err) {
      console.log(err);
    }

    res.send(todo);
  });
});

app.listen(3000, () => {
  console.log('Todos API lsiten on port 3000');
});