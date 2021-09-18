import express from 'express';
import cors from 'cors';
import config from './config';
import { routesInit } from './routes-init';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

routesInit(app);

app.listen(config.http.port, () => {
  console.log(`Application running on ${config.http.port}`);
});
