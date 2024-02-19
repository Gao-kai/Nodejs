import path from "path";
import tsPlugin from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";

/* 获取打包时传递的环境变量的TARGET 找到TARGET模块对应的package.json */
const TARGET = process.env.TARGET;
const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, TARGET);

/* 以TARGET模块的根目录为基础路径来解析文件 */
const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve("./package.json"));

/* 获取构建选项 */
const buildOptions = pkg.buildOptions || {};

/* 基于打包产物格式 配置 打包输出信息 */
const outputConfigs = {
  "esm-bundler": {
    file: resolve(`dist/${TARGET}.esm-bundler.js`),
    format: "es",
  },
  "esm-browser": {
    file: resolve(`dist/${TARGET}.esm-browser.js`),
    format: "umd ",
  },
  cjs: {
    file: resolve(`dist/${TARGET}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${TARGET}.global.js`),
    format: "iife",
  },
};
console.log({
  target: process.env.TARGET,
  packagesDir,
  packageDir,
  pkg,
});

/* 基于不同包的buildOptions创建不同的打包配置 */
function createBuildConfig(format, output) {
  output.sourcemap = process.env.SOURCE_MAP || true;
  output.exports = "named"; // 需要import {ref} from "@vue/reactivity"才可以导入

  let external = [];
  if (format === "global") {
    output.name = buildOptions.name;
  } else {
    const dependencies = Object.keys(pkg.dependencies || {});
    external = [...dependencies];
  }

  return {
    input: resolve("./src/index.ts"),
    output,
    external,
    plugins: [
      json(),
      //   先解析ts
      tsPlugin({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
      }),
      //   再解析第三方模块
      nodeResolve(),
    ],
  };
}

const rollupBuildConfigs = buildOptions.formats.map((format) => {
  return createBuildConfig(format, outputConfigs[format]);
});

/**
 * rollup.config.js要求我们默认导出一个对象或者一个数组
 * 数组用于多个输入的情况
 */
export default rollupBuildConfigs;
