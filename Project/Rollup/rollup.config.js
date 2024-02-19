import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript2";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

/**
 * 配置文件为一个ES Module的时候 webpack默认都是CJS模块 因为需要交给node执行
 * 遇到问题：
 * 1. 需要读取__dirname等CJS模块中才有的变量
 * import { fileURLToPath } from "node:url";
 * import { dirname } from "path";
 *
 * const esmURL = import.meta.url
 * const
 *
 * 2. 读取 package.json
 *
 */
import { createRequire } from "node:module";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const EsModuleURL = import.meta.url; // 本地系统文件路径 file:///

// 'C:\\Users\\克林辣舞\\Desktop\\手写Rollup\\rollup.config.js',
const fileName = fileURLToPath(import.meta.url); // 转化为path

// __dirname: 'C:\\Users\\克林辣舞\\Desktop\\手写Rollup'
const __dirname = path.dirname(fileName);

// Node API
// 用于构造 require 函数的文件名。 必须是文件网址对象、文件网址字符串、或绝对路径字符串
// 返回: <require> require 函数
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const pkgJSON = JSON.parse(readFileSync("./package.json"));

console.log({
  fileURLToPath,
  EsModuleURL,
  fileName,
  __dirname,
  //   require,
  pkg,
  pkgJSON,
  process: process.env.ENV,
});
export default defineConfig({
  input: "src/main.js",
  output: [
    {
      dir: "bundle",
      entryFileNames: "[name]-[hash]-[format].js",
      format: "esm",
    },
    {
      dir: "bundle",
      entryFileNames: "[name]-[hash]-[format].js",
      format: "cjs",
    },
    {
      dir: "bundle",
      entryFileNames: "[name]-[hash]-[format].min.js",
      format: "umd",
      name: "ROLLUP",
      plugins: [terser()],
    },
  ],
  plugins: [json(), commonjs(), typescript()],
});

/**
 * @type {import('rollup').RollupOptions}
 */
const confif = {};

/**
 * @type {import('rollup'.RollupOutput)}
 */
const outputOptions = {};

/**
 * @type {import('rollup'.Plugin)}
 */
const plugins = {};
