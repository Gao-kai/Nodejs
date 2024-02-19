/**
 * 非常好的写法
 * 将lib目录下的所有导出接口汇聚起来
 * 避免了：
 * exports.xxx = require("xxx")
 * exports.yyy = require("yyy")
 * exports.zzz = require("zzz")
 */
console.log(require(`./lib/module`));

["module", "pluginResolution"].forEach((moduleName) => {
  Object.assign(exports, require(`./lib/${moduleName}`));
});
