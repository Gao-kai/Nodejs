const path = require("path");
const Module = require("module");

/**
 *
 * @param {*} request @vue/cli-service/generator
 * @param {*} targetDir 创建新项目的路径
 */
function loadModule(request, targetDir) {
  let basePath = path.resolve(targetDir, "package.json");
  //   返回require函数
  const nodeRequire = Module.createRequire(basePath);
  //   加载模块并返回文件的接口
  return nodeRequire(request);
}

module.exports = {
  loadModule,
};
