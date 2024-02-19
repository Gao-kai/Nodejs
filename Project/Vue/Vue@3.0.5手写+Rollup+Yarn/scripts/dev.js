/**
 * @description 只针对单个模块进行打包
 */
const execa = require("execa");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
const target = args.target;
console.log({
  target,
});

if (!target) {
  console.error("单独打包必须使用--target参数指定打包目标package");
  return;
}

/**
 * 执行打包 会读取rollup.config.js中的配置进行打包
 */
async function build(target) {
  await execa(
    "rollup",
    [
      "--watch",
      "-c", // 使用配置文件rollup.config.js
      "--environment", // 通过 process.ENV 传递额外的设置给配置文件
      `TARGET:${target}`, // process.env.TARGET === ${target}
    ],
    { stdio: "inherit" } // 子进程打包的信息共享给父进程
  );
}

build(target);
