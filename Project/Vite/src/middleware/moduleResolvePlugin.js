const makeVuePackgesMapping = require("../utils/makeVuePackgesMapping");
/**
 * @description 浏览器向@modules目录下请求资源
 * @param {*} param0
 */
const modeleReg = /^\/@modules\//;
const path = require("path");
const fs = require("fs").promises;

function moduleResolvePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    // 如果请求的静态资源路径没有包含/@modules 那么说明这部分不需要处理
    if (!modeleReg.test(ctx.path)) {
      console.log("module-ResolvePlugin执行1", ctx.path);
      return next();
    } else {
      console.log("module-ResolvePlugin执行2", ctx.path);
      // 获取到目标模块的名称
      const id = ctx.path.replace(modeleReg, "");
      ctx.type = "js";

      // 从mapping中获取id对应的path
      const vueSourceMapping = makeVuePackgesMapping(root);
      const modulePath = vueSourceMapping[id];

      //    定位到path就去读取资源
      const content = await fs.readFile(modulePath, "utf-8");

      // 读取结果挂载到body上
      ctx.body = content;
    }
  });
}

module.exports = moduleResolvePlugin;
