#!/usr/bin/env node
/**
 * 当用户在终端执行vue create projectName的时候
 * 就会找到全局node.js目录下的可执行脚本也就是当前这个文件开始工作流程
 */
const program = require("commander");
const pkg = require("../package.json");
program.version(`${pkg.name} ${pkg.version}`).usage("<command> [options]");

program
  .command("create <app-name>")
  .description("create a new project powered by gk-vue-cli!")
  .action((appName, cmd) => {
    require("../lib/create")(appName);
  });

program.parse();
