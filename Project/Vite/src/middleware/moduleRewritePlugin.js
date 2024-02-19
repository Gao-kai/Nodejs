/**
 * vite将所有不带./ ../ /的文件资源全部增加一个/@modules/
 */
const readBody = require("../utils/readBody.js");
/**
 * es-module-lexer 是一个可以对 ES Module 语句进行词法分析的工具包。
 * 它压缩后之后只有 4 KiB，其底层通过内联（Inline） WebAssembly 的方式来实现对 ES Module 语句的快速词法分析。
 */
const { parse } = require("es-module-lexer");
const MagicString = require("magic-string");

function moduleRewritePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    // 先执行静态资源读取中间件 既可以在前面处理逻辑 也可以在后面处理逻辑
    console.log("module-Rewrite-Plugin执行1", ctx.path);
    await next();

    // 只处理js静态可读流 其他文件不考虑
    /**
     * response.is(types...)
     * 检查请求所包含的 "Content-Type" 是否为给定的 type 值。
     * 如果没有 response body，返回 undefined。
     * 如果没有 response type，或者匹配失败，返回 false。
     * 否则返回匹配的 content-type。
     */
    if (ctx.body && ctx.response.is("js")) {
      console.log("module-Rewrite-Plugin执行2", ctx.path);
      // console.log(ctx.response.body.path);

      // 这里可以拿到文件中的代码字符串
      let content = await readBody(ctx.body);
      // console.log("before\n", content);

      // 进一步将文件中无法识别的路径进行重写 比如将import vue from 'vue' 修改为import vue from “/@modules/vue.js”
      let res = rewriteImports(content);
      // console.log("after\n", res);

      // 返回 最终中间件执行完成 ctx.body是什么 返回的就是什么
      ctx.body = res;
    }
  });
}

/**
 * 字符串具有不可变性 不可以str[0] = 100
 * @param {*} sourceCode
 */
function rewriteImports(sourceCode) {
  const result = parse(sourceCode);
  const imports = result[0];
  /* 
    [
        { n: './vue', s: 27, e: 32, ss: 0, se: 33, d: -1, a: -1 },
        { n: './App.vue', s: 52, e: 61, ss: 35, se: 62, d: -1, a: -1 }
    ],
    
  */
  // console.log(imports);

  const magicString = new MagicString(sourceCode);

  if (imports.length) {
    for (const item of imports) {
      // 拿到在源码中的起始和结束位置
      const { s: start, e: end } = item;
      // 从源码中截取到模块名 比如 vue  './App.vue'
      let moduleName = sourceCode.substring(start, end);
      // 如果不是以./ ../ / 开头的模块名 那么就需要将名称进行重写
      if (/^[^\/\.]/.test(moduleName)) {
        // 增加 /@modules 前缀
        moduleName = `/@modules/${moduleName}`;
        magicString.overwrite(start, end, moduleName);
      }
    }
  }

  // import { createApp } from "/@modules/vue";
  return magicString.toString();
}

module.exports = moduleRewritePlugin;
