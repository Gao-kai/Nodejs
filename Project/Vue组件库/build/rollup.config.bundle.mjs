/**
 * rollup全量打包
 */
import path from "path";
import { fileURLToPath } from "url";
import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { getPackagesSync } from "@lerna/project";
import vue from "rollup-plugin-vue";

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const inputs = getPackagesSync()
  .map((pck) => pck.name)
  .filter((name) => name.includes("@g-ui"));

console.log(inputs);

export default {
  input: path.resolve(DIRNAME, `../packages/g-ui/index.ts`),
  output: {
    format: "es",
    file: `lib/index.esm.js`,
  },
  plugins: [
    nodeResolve(),
    vue({
      target: "browser",
    }),
    // 默认调用tsconfig.json 会生成声明文件
    typescript({
      tsconfigOverride: {
        exclude: ["node_modules", "website"],
      },
    }),
  ],
  external(id) {
    // 排除vue本身 只要源码中用到了vue的包都不进行打包 因为使用者会提供
    return /^vue/.test(id);
  },
};
