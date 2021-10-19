import fs from "fs/promises";
import express from "express";
import { employeeRouterFactory } from "./routes";
import config from "./config";
import { delay } from "./helpers";
import { loggerFactory } from './logger';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => {
  res.status(200).json("ok");
});

let variable = 'not called'

process.on('SIGTERM', () => {
  console.log('variable value', variable);
});

app.get("/shutdown", async (_, res) => {
  // TODO: Investigate why this is not called.
  variable = 'called';
  res.send('closing');
});

app.get("/downward", (_, res) => {
  const memoryLimit = config.downwardAPI['memoryLimit'];
  const podIp = config.downwardAPI['podIP'];
  res.send(JSON.stringify({ podIp, memoryLimit }));
});

app.get('/downward/pod-info', async (_, res) => {
  try {
    const content = fs.readdir(`${__dirname}/pod-info`);
    res.send(content);
  } catch (exception) {
    console.error(exception);
    res.send('No directory found')
  }
});

// TODO: Create file for readiness probe
(async () => {
  await delay(+config.system.delayStartup);
  const logger = await loggerFactory();
  app.use("/employees", employeeRouterFactory(logger));

  app.listen(config.http.port, async () => {
    console.log(`Application running on ${config.http.port}`);
    await fs.writeFile(
      `${__dirname}/service-ready`,
      JSON.stringify(process.resourceUsage())
    );
  });
})();
