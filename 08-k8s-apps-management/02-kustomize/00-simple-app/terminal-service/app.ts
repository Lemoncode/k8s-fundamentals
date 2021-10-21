import express from 'express';
import cors from 'cors';
import config from './config';
import { terminalRouter } from './terminal.router';

(() => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.use('/api/terminals', terminalRouter());

  app.listen(config.http.port, () => {
    console.log(`Application running on ${config.http.port}`);
  });
})();



