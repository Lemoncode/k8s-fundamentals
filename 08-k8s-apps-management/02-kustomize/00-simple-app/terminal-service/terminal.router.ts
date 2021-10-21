import { Router } from 'express';
import { TerminalApi } from './terminal.model';

const terminals: TerminalApi[] = [
  {
    codTerminal: '00001',
    id: 1,
    nomTerminal: 'my-terminal',
    zipAddress: '893-io'
  },
  {
    codTerminal: '00002',
    id: 2,
    nomTerminal: 'other-terminal',
    zipAddress: '894-ix'
  },
];

export const terminalRouter = () => {
  const router = Router();

  router.get('/', (_, res) => {
    res.send(terminals);
  });

  return router;
};