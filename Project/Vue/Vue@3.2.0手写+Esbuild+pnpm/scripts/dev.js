const minimist = require("minimist");
const { build } = require("esbuild");
const { resolve } = require("path");

/* 解析参数 读取打包目标和打包产物的规范 */
const args = minimist(process.argv.slice(2));
const target = args.p || "reactivity";
const format = args.f || "global";
console.log({
  target,
  format,
});

/* esbuild打包配置 */
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));
const outputFormat = format.startsWith("global")
  ? "iife"
  : format === "cjs"
  ? "cjs"
  : "esm";

const outfile = resolve(
  // 输出的文件
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true,
  sourcemap: true,
  format: outputFormat,
  globalName: pkg.buildOptions?.name,
  platform: format === "cjs" ? "node" : "browser",
  watch: {
    // 监控文件变化
    onRebuild(error) {
      if (!error) console.log(`😜😊😎😘 重新打包rebuild`);
    },
  },
}).then(() => {
  console.log("😜😊😎😘 持续watch");
});
