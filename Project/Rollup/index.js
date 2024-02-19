// import { cloneDeep } from "lodash";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const json = readFileSync("./package.json");
const info = JSON.parse(json);

console.log({
  __filename,
  __dirname,
  info,
});
