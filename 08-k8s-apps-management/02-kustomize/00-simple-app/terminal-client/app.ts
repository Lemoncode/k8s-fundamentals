import axios from 'axios';
import { Lookup, TerminalApiResponse } from './terminal-api.model';
import config from './config';

const { terminalService } = config;

const getTerminals = (): Promise<TerminalApiResponse[]> =>
  axios.get<TerminalApiResponse[]>(terminalService.url)
    .then(({ data }) => data);

(async () => {
  const terminals = await getTerminals();
  const mappedTeminals = terminals.map<Lookup>((t) => ({ id: t.id.toString(), name: t.nomTerminal }))
  console.log(mappedTeminals);
})();