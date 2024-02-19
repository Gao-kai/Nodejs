const koa = require("koa");
const serveStaticPlugin = require("./middleware/serveStaticPlugin");
const moduleRewritePlugin = require("./middleware/moduleRewritePlugin.js");
const moduleResolvePlugin = require("./middleware/moduleResolvePlugin.js");
const vueResolvePlugin = require("./middleware/vueResolvePlugin.js");
const htmlRewritePlugin = require("./middleware/htmlRewritePlugin.js");

function createServer() {
  const app = new koa();
  const root = process.cwd(); // 进程启动的工作目录 在哪里执行的vite命令 这个root就是当前目录：C:\Users\克林辣舞\Desktop\Vite\vite-handwrite

  const context = {
    app,
    root,
  };

  // 拓展ctx属性
  app.use((ctx, next) => {
    Object.assign(ctx, context);
    return next();
  });

  // 依次注册所有插件 洋葱圈模型
  const resolvePlugins = [
    htmlRewritePlugin,
    moduleRewritePlugin, // 裸模块路径重写为 /@modules/xxx.js
    moduleResolvePlugin, // 找到node_modules对应的js文件 读取出来 挂载到ctx.body上
    vueResolvePlugin, // 遇到vue文件先进行单文件组件解析
    serveStaticPlugin, // 静态资源服务
  ];

  resolvePlugins.forEach((plugin) => {
    plugin(context);
  });

  return app;
}

const app = createServer();
app.listen(8899, () => {
  console.log("Vite Server Listening on 8899!");
});
