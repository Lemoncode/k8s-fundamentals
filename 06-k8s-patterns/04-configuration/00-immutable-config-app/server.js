const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { startServer } = require('./start-server');
const { configReader } = require('./config-reader.service');

app.use(cors());
app.use(bodyParser.json());

(async () => {
  const config = await configReader.readConfig();
  startServer(config, app);
})();
