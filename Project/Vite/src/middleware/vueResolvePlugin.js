const path = require("path");
const fs = require("fs").promises;
const makeVuePackgesMapping = require("../utils/makeVuePackgesMapping");

module.exports = function vueResolvePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith(".vue")) {
      return next();
    }

    // 路径有/必须使用join 不能用resolve
    const filePath = path.join(root, ctx.path);
    const content = await fs.readFile(filePath, "utf-8");
    console.log(content);

    // 要将.vue文件编译为.js文件 然后挂载到ctx.body上
    // 先拿到vue原生给的compiler-sfc的cjs模块路径
    const vueSourceMapping = makeVuePackgesMapping(root);

    // 模块读取 并结构出compileTemplate,parse方法
    const { compileTemplate, parse } = require(vueSourceMapping["compiler"]);
    const { descriptor } = parse(content);
    //   console.log(descriptor);

    // 如果query上没有type属性 那么就是App.vue文件
    if (!ctx.query.type) {
      let code = "";

      const vueScript = descriptor.scriptSetup || descriptor.script;
      if (vueScript) {
        let vueScriptContent = vueScript.content;
        console.log("vueScriptContent", vueScriptContent);
        /**
         * 要将脚本中的export default替换为空 前面可能是：
         * 1. 1个或多个空格 \s*
         * 2. 有一个换行 \n
         * 3. 有分号 ;
         *
         * export default {}
         *
         * ?: 只匹配不捕获
         * $1 表示匹配到的前面的分号等还需要保留在源码中
         *  import HelloWorld from './components/HelloWorld.vue'
            export default {
            name: "App"
            }

            import HelloWorld from './components/HelloWorld.vue'
            const __script= {
            name: "App"
            }

         */
        code += vueScriptContent.replace(
          /((?:^|\n|;)\s*)export default/,
          "$1const __script="
        );

        // 如果有模板 先将路径再次重写 这里就是加一个type=template的查询参数
        // 会接着发起请求 下次请求的时候才做模板解析
        // 分卡处理模板和脚本的原因在于修改模板只需要热更新模板 不需要热更新脚本
        if (descriptor.template) {
          const requestPath = ctx.path + `?type=template`;
          code += `\nimport { render as __render } from "${requestPath}"`;
          code += `\n__script.render = __render`;
        }

        code += `\nexport default __script`;

        ctx.type = "js";
        ctx.body = code;

        console.log("code", code);
      }
    }

    if (ctx.query.type === "template") {
      // 进行模板编译
      let vueTemplateContent = descriptor.template.content;
      // 将vueTemplateContent编译为render函数代码字符串
      let render = compileTemplate({
        source: vueTemplateContent,
        id: ctx.path,
      });
      let renderFnString = render.code;
      console.log("renderFnString", renderFnString);

      ctx.type = "js";
      ctx.body = renderFnString;
    }
  });
};
