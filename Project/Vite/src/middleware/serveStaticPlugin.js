const path = require("path");
const static = require("koa-static");

/**
 * 静态资源插件
 * 浏览器请求index.html文件
 * 解析其中的type=module的脚本
 * 请求脚本
 * 脚本中有import语法并且是相对路径 此时会接着发起请求
 *
 * Uncaught TypeError: Failed to resolve module specifier "vue". Relative references must start with either "/", "./", or "../".
 * ES6 Module会自动发送请求 查找响应文件 所以vite不需要打包 打包是浏览器完成的
 * Vite在这个过程中对vue等第三方包进行改写
 */
function serveStaticPlugin({ app, root }) {
  // 当前root目录当做静态资源读取的基础目录
  app.use(static(root));

  // 根目录找不到就去public找
  app.use(static(path.resolve(root, "public")));
}

module.exports = serveStaticPlugin;
