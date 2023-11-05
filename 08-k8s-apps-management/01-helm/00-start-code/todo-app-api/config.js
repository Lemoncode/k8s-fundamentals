// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const config = {
  connectionString: "",
};

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  config.connectionString = process.env.MONGODB_URI;
} else {
  config.connectionString = process.env.MONGODB_URI;
}

export default config;
