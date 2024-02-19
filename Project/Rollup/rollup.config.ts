import type { RollupOptions } from "rollup";

const config: RollupOptions = {
  /* 你的配置 */
  input: "src/main.js",
  output: {
    file: "bundle.js",
    format: "cjs",
  },
};

export default config;
