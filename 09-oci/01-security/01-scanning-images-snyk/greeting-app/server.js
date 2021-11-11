const express = require('express');
const { http } = require('./config');

const app = express();

app.get('/greeting', (req, res) => {
  const { person } = req.query;
  res.send(`Hola ${person}`);
});

app.listen(http.port, () => {
  console.log(`Application listening on port ${http.port}`);
});

// curl -X GET "http://localhost:5000/locations?id=3"