// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
import { createRequire } from "module";
const require = createRequire(import.meta.url);

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const config = {
  connectionString: process.env.MONGODB_URI || "",
};

export default config;
