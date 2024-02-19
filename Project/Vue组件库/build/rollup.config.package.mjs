/**
 * rollup单个打包
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

/**
 * rollup会读取配置文件的导入
 * 单个对象 会开始打包
 * 一个数组 会开启多进程打包
 */
export default inputs.map((name) => {
  const pckName = name.split("@g-ui")[1];
  return {
    input: path.resolve(DIRNAME, `../packages/${pckName}/index.ts`),
    output: {
      format: "es",
      file: `lib/${pckName}/index.js`,
    },
    plugins: [
      nodeResolve(),
      vue({
        target: "browser",
      }),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            // 打包单个组件的时候不生成ts声明文件 因为全量打包的时候已经生成了
            declaration: false,
          },
          exclude: ["node_modules"],
        },
      }),
    ],
    external(id) {
      // 源码里面出现引入vue这个包需要忽略
      // 源码里面的A组件引入了自己写的某个B组件 此时不需要打包B组件了 比如Button组件中用到了Icon组件 没必要再打包Button组件的时候将Icon组件再打包一次
      return /^vue/.test(id) || /^@g-ui/.test(id);
    },
  };
});
