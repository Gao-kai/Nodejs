const Bundle = require("../src/bundle");
/**
 * @description 执行打包
 * @param {*} entry 入口文件绝对路径
 * @param {*} outputFileName 出口文件名称
 */
function rollup(entry, outputFileName) {
  // 创建一个bundle对象 上面有当前打包的所有模块对象
  const bundle = new Bundle({
    entry,
  });

  // 调用build方法执行编译 会得到一个module实例对象
  bundle.build(outputFileName);
}

module.exports = rollup;
