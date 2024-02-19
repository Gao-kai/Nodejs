/**
 * @description 将packages目录下所有模块进行打包
 */
const fs = require("fs");
const execa = require("execa");

const targets = fs.readdirSync("packages").filter((f) => {
  if (fs.statSync(`packages/${f}`).isDirectory()) {
    return true;
  }
  return false;
});

async function build(target) {
  await execa(
    "rollup",
    [
      "-c", // 使用配置文件rollup.config.js
      "--environment", // 通过 process.ENV 传递额外的设置给配置文件
      `TARGET:${target}`, // process.env.TARGET === ${target}
    ],
    { stdio: "inherit" } // 子进程打包的信息共享给父进程
  );
}

async function runParallel(source, iteratorFn) {
  const res = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    res.push(p);
  }
  return Promise.all(res);
}

runParallel(targets, build).then(() => {
  console.log("packages下的所有包打包完成！！！");
});
