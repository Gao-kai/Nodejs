const { isPlugin } = require("cli-shared-utils");
const GeneratorAPI = require("./GeneratorAPI.js");
const path = require("path");
const fs = require("fs-extra");

class Generator {
  /* 
    plugins:[
      {
        id,
        apply:从@vue/cli-service/generator中加载的模块文件
        options：插件配置项 对于@vue/cli-service来说挂载的是根想爱你想
      }
    ]
  */
  constructor(targetDir, { pkg = {}, plugins = [] }) {
    this.targetDir = targetDir;
    this.plugins = plugins;
    this.pkg = Object.assign({}, pkg);

    // 会把所有要生成的文件和文件内容放在files对象中
    this.files = {};
    this.fileMiddlewares = [];

    // 从package.json中加载所有官方插件和用户插件
    this.allPluginIds = Object.keys(this.pkg.dependencies || {})
      .concat(Object.keys(this.pkg.devDependencies || {}))
      .filter(isPlugin);

    // 找到核心插件然后取出根配置
    const cliService = plugins.find(
      (plugin) => plugin.id === "@vue/cli-service"
    );
    // cliService.options就是预设对象 非常特殊
    this.rootOptions = cliService.options;
  }

  async generate({ extractConfigFiles = false, checkExisting = false } = {}) {
    console.log("生成配置文件...");

    /* 依次为插件生成一个generator 修改配置 注入中间件 */
    await this.initPlgins();

    /* 抽取package中的配置信息到单独的文件中 */
    // this.extractConfigFiles(extractConfigFiles, checkExisting);
  }

  async initPlgins() {
    for (const plugin of this.plugins) {
      const { id, apply, options } = plugin;

      const api = new GeneratorAPI(id, this, options, this.rootOptions);
      /* 
        调用apply的过程中只要调用api.render就会给 this.fileMiddlewares中注入中间件
        调用apply的过程中只要遇到extendPackage就会给this.pkg拓展属性
      */
      await apply(api, options, this.rootOptions);

      /* 执行中间件 给files写入内容 */
      await this.resolveFiles();

      /* 排序package字段 */
      // this.sortPkg();

      /* 更新package.json文件 ' */
      this.files["package.json"] = JSON.stringify(this.pkg, null, 2) + "\n";

      /* 写入文件 */
      await this.writeFileTree(this.targetDir, this.files);
    }
  }

  writeFileTree(targetDir, files) {
    Object.keys(files).forEach((name) => {
      const filePath = path.join(targetDir, name);
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, files[name]);
    });
  }

  async resolveFiles() {
    const files = this.files;
    for (const middleware of this.fileMiddlewares) {
      await middleware(files);
    }

    /* 
      normalizeFilePaths：格式化文件路径
      slash把 windows下的//变为\
    */
    const slash = (await import("slash")).default;
    Object.keys(files).forEach((file) => {
      const normalized = slash(file);
      if (file !== normalized) {
        files[normalized] = files[file];
        delete files[file];
      }
    });
  }

  extractConfigFiles(extractAll, checkExisting) {
    console.log("抽取配置到单独的文件中");
    const defaultConfigTransforms = {
      babel: new ConfigTransform({
        file: {
          js: ["babel.config.js"],
        },
      }),
      postcss: new ConfigTransform({
        file: {
          js: ["postcss.config.js"],
          json: [".postcssrc.json", ".postcssrc"],
          yaml: [".postcssrc.yaml", ".postcssrc.yml"],
        },
      }),
      eslintConfig: new ConfigTransform({
        file: {
          js: [".eslintrc.js"],
          json: [".eslintrc", ".eslintrc.json"],
          yaml: [".eslintrc.yaml", ".eslintrc.yml"],
        },
      }),
      jest: new ConfigTransform({
        file: {
          js: ["jest.config.js"],
        },
      }),
      browserslist: new ConfigTransform({
        file: {
          lines: [".browserslistrc"],
        },
      }),
    };

    const reservedConfigTransforms = {
      vue: new ConfigTransform({
        file: {
          js: ["vue.config.js"],
        },
      }),
    };

    const configTransforms = Object.assign(
      {},
      defaultConfigTransforms,
      this.configTransforms,
      reservedConfigTransforms
    );

    /* 
      从pkg中删除对应的key 并且抽取到新的文件
      比如key是eslint 
    */
    const extract = (key) => {
      if (configTransforms[key] && this.pkg[key]) {
        const value = this.pkg[key];
        const configTransform = configTransforms[key];
      }
    };

    if (extractAll) {
      for (const key in this.pkg) {
        extract(key);
      }
    } else {
      extract("vue");
      extract("babel");
    }
  }

  hasPlugin(inputId) {
    return [...this.plugins.map((p) => p.id), ...this.allPluginIds].some(
      (fullId) => {
        const pluginRE = /^(@vue\/|vue-|@[\w-]+(\.)?[\w-]+\/vue-)cli-plugin-/;
        const shortId = fullId.replace(pluginRE, "");
        return fullId === inputId || shortId === inputId;
      }
    );
  }
}
module.exports = Generator;
