import fs from "fs/promises";

export interface FileWriter {
  writeToFile: (input: string) => Promise<void>;
}

export const loggerFactory = async (): Promise<FileWriter> => {
  await fs.mkdir(`${__dirname}/logs`);
  const logsPath = `${__dirname}/logs/log`

  return {
    writeToFile: async (input: string) => {
      await fs.appendFile(logsPath, `${input}\n`);
    }
  };
};
