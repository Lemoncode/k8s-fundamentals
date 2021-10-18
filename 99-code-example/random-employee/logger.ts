import fs from "fs/promises";

export interface FileWriter {
  writeToFile: (input: string) => Promise<void>;
}

const logsExists = async (): Promise<Boolean> => {
  const directoryContent = await fs.readdir(`${__dirname}`);
  const logsMatches = directoryContent.filter((c) => c === 'logs');
  return logsMatches.length > 0;
};

const createLogsDirectory = async (): Promise<void> => {
  const logsCreated = await logsExists();
  if (!logsCreated) {
    console.log('Creating logs path');
    await fs.mkdir(`${__dirname}/logs`);
  }
}

export const loggerFactory = async (): Promise<FileWriter> => {
  await createLogsDirectory();
  const logsPath = `${__dirname}/logs/log`

  return {
    writeToFile: async (input: string) => {
      await fs.appendFile(logsPath, `${input}\n`);
    }
  };
};
