const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const { merge } = require("lodash");
const { isBinaryFileSync } = require("isbinaryfile");
const { toShortPluginId } = require("cli-shared-utils");
const isObject = (val) => val && typeof val === "object";

module.exports = class GeneratorAPI {
  constructor(id, generator, options, rootOptions) {
    this.id = id;
    this.generator = generator;
    this.options = options;
    this.rootOptions = rootOptions;
    this.pluginsData = generator.plugins
      .filter(({ id }) => id !== `@vue/cli-service`)
      .map(({ id }) => ({
        name: toShortPluginId(id),
      }));
  }

  /**
   * api.render(
   *    './template',
   *    {doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript')}
   * )
   * @param {*} source  ./template
   * @param {*} additionalData  {doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript')}
   */
  render(source, additionalData) {
    // 获取render方法在用户的那个目录下调用:
    // C:\Users\克林辣舞\Desktop\demo\node_modules\@vue\cli-service\generator
    const baseDir = extractCallDir();
    if (typeof source === "string") {
      // 路径拼接 拿到模板存放的路径
      // C:\Users\克林辣舞\Desktop\demo\node_modules\@vue\cli-service\generator\template
      source = path.resolve(baseDir, source);
      // 插入中间件
      this._injectFileMiddleware(async (files) => {
        const data = this._resolveData(additionalData);

        // 匹配当前目录下的所有文件名字符串组成的数组
        const { globby } = await import("globby");

        // ['packages/cli/lib/create.js','packages/cli/lib/Creator.js',]
        const _files = await globby(["**/*"], { cwd: source });
        for (const rawPath of _files) {
          // 对目录中_开头的需要处理下 因为.gitignore文件会在npm发布的时候忽略 为了不忽略 把_gitignore转化成为.gitignore
          const targetPath = rawPath
            .split("/")
            .map((filename) => {
              if (filename.charAt(0) === "_" && filename.charAt(1) !== "_") {
                return `.${filename.slice(1)}`;
              }
              return filename;
            })
            .join("/");
          // 拿到每一个template下的文件绝对路径
          const sourcePath = path.resolve(source, rawPath);
          //  读取文件内容并完成ejs的渲染
          const content = this.renderFile(sourcePath, data);
          //  将二进制和非其他文件依次先写入文件树对象
          files[targetPath] = content;
        }
      });
    }
  }

  renderFile(sourcePath, data) {
    if (isBinaryFileSync(sourcePath)) {
      return fs.readFileSync(sourcePath); // return buffer
    }
    const template = fs.readFileSync(sourcePath, "utf-8");
    const content = ejs.render(template, data);
    return content;
  }

  _injectFileMiddleware(middleware) {
    this.generator.fileMiddlewares.push(middleware);
  }

  _resolveData(additionalData) {
    return Object.assign(
      {
        options: this.options, // 当前插件的配置对象
        rootOptions: this.rootOptions, // 整个项目的根配置preset
        plugins: this.pluginsData, // 除了核心插件vue-cli-service之外的插件 比如eslint babel等
      },
      additionalData // 插件调用api.render时传入的配置
    );
  }

  /* 
    api.extendPackage({
        scripts: {
            'serve': 'vue-cli-service serve',
            'build': 'vue-cli-service build'
        },
        browserslist: [
            '> 1%',
            'last 2 versions',
            'not dead'
        ]
    })
  */
  extendPackage(fields) {
    const pkg = this.generator.pkg;

    for (const key in fields) {
      const value = fields[key];
      const existing = pkg[key];
      // 如果要拓展的是一个依赖项 那么进行一个浅层合并即可 因为依赖就只有一层
      if (
        isObject(value) &&
        (key === "dependencies" || key == "devDependencies")
      ) {
        // 添加依赖项
        pkg[key] = Object.assign(existing || {}, value);
      } else if (Array.isArray(value) && Array.isArray(existing)) {
        // 如果要拓展的是一个数组 比如browserslist 那么去重
        pkg[key] = Array.from(new Set([...existing, ...value]));
      } else if (isObject(value) && isObject(existing)) {
        // 如果拓展的是对象 并且不是依赖项 那么深层合并
        pkg[key] = merge(existing, value);
      } else {
        // 不存在 那么添加一个
        pkg[key] = value;
      }
    }
  }

  hasPlugin(id) {
    return this.generator.hasPlugin(id);
  }
};

/**
 *
 * @returns 获取当前方法调用的目录
 */
function extractCallDir() {
  // extract api.render() callsite file location using error stack
  const obj = {};
  Error.captureStackTrace(obj);
  const callSite = obj.stack.split("\n")[3];

  // the regexp for the stack when called inside a named function
  const namedStackRegExp = /\s\((.*):\d+:\d+\)$/;
  // the regexp for the stack when called inside an anonymous
  const anonymousStackRegExp = /at (.*):\d+:\d+$/;

  let matchResult = callSite.match(namedStackRegExp);
  if (!matchResult) {
    matchResult = callSite.match(anonymousStackRegExp);
  }

  const fileName = matchResult[1];
  return path.dirname(fileName);
}
