const { defaults } = require("./options.js");
const inquirer = require("inquirer");
const PromptModuleAPI = require("./PromptModuleAPI.js");
const cloneDeep = require("lodash.clonedeep");
const chalk = require("chalk");
const writeFileTree = require("./utils/writeFileTree");
const { loadModule } = require("cli-shared-utils");
const Generator = require("./Generator.js");

/**
 * 判断是否为手工选择模式
 */
function isManualMode(answers) {
  return answers.preset === "__manual__";
}

class Creator {
  constructor(targetDir, appName, promptModules) {
    this.appName = appName;
    this.targetDir = targetDir;
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
    /* 原始默认的三个预设 vue2 vue3 manally */
    this.presetPrompt = presetPrompt;
    /* 选择了manally之后给用户提供的选项 */
    this.featurePrompt = featurePrompt;
    /* 当用户选了featurePrompt中的某一项之后会弹出新的选择框供进一步精细化选择 */
    this.injectedPrompts = [];
    /* 最终选择完成之后需要执行的回调函数队列 */
    this.promptCompleteCbs = [];
    /* 
        创建一个专门提供插入选项的API类
        promptModules放着的都是一个个的函数，接受一个参数，这个参数就是创建出来的API实例
        在promptModules中每一个函数都可以拿到这样一个API实例
        然后调用API实例上的方法完成选项的插入Inject
    */
    const promptAPI = new PromptModuleAPI(this);
    promptModules.forEach((promptModule) => promptModule(promptAPI));

    this.run = this.run.bind(this);
  }

  /* 在node中执行CMD命令 比如执行git init npm install等 */
  async run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }
    const { execa } = await import("execa");
    return execa(command, args, { cwd: this.targetDir });
  }

  /* 主流程main函数 */
  async create() {
    let preset = await this.promptAndResolvePreset();
    preset = cloneDeep(preset);

    const { appName, targetDir } = this;
    // 注入核心包
    preset.plugins["@vue/cli-service"] = Object.assign(
      { projectName: appName },
      preset
    );
    console.log(`✨ Creating project in ${chalk.yellow(targetDir)}.`);

    // 基于插件配置生成package.json信息
    const pkg = {
      name: appName,
      version: "0.1.0",
      private: true,
      devDependencies: {},
    };

    const deps = Object.keys(preset.plugins);
    deps.forEach((dep) => {
      pkg.devDependencies[dep] = "latest";
    });

    // 写入目标目录
    await writeFileTree(targetDir, {
      "package.json": JSON.stringify(pkg, null, 2),
    });

    // 初始化git目录
    console.log(`🗃  Initializing git repository...`);
    await this.run("git init");

    // 安装预设插件 @vue/cli-service @vue/cli-plugin-eslint...
    console.log(
      `⚙\u{fe0f}  Installing CLI plugins. This might take a while...`
    );
    await this.run("npm install");

    // 基于插件修改配置然后生成
    console.log(`🚀  Invoking generators...`);
    const plugins = await this.resolvePlugins(preset.plugins, pkg);

    const generator = new Generator(targetDir, {
      pkg,
      plugins,
    });
    await generator.generate();

    // 再次执行一次npm install
    console.log(`📦  Installing additional dependencies...`);
    await this.run("npm install");

    console.log(`😁  Vue Cli success create a new project`);
  }

  async resolvePlugins(rawPlugins, pkg) {
    const plugins = [];

    for (const id of Object.keys(rawPlugins)) {
      // apply就是对应模块文件导出的接口 这里的接口都是一个函数
      // 去用户的项目目录下加载@vue/cli-service包里面的generator文件夹下的index.js文件
      // 而不是加载自己的文件
      const apply = loadModule(`${id}/generator`, this.targetDir) || (() => {});
      let options = rawPlugins[id] || {};
      plugins.push({ id, apply, options });
    }

    return plugins;
  }

  async promptAndResolvePreset() {
    // answers就是inquirer工具收集的用户选择的一个个选项的答案 全部汇聚起来
    // 比如：{
    //  preset: '__manual__',
    //  features: [ 'vueVersion' ],
    //  vueVersion: '2'
    // }
    let answers = await inquirer.prompt(this.resolveFinalPrompts());
    let preset;

    if (answers?.preset !== "__manual__") {
      // 表示用户选择了默认的预设 此时开始加载默认配置
      preset = await this.resolvePreset(answers.preset);
    } else {
      // 手动选择个性化预设
      preset = {
        plugins: {},
      };
      // 害怕用户一个也不选择 那么需要默认给一个空数组
      answers.features = answers.features || [];

      // 选择完成之后 执行每一个feature注册的回调 这一步会进一步的完善预设对象preset
      // 也就是插件是通过每一个promptModules通过onPromptComplete完成的
      this.promptCompleteCbs.forEach((cb) => cb(answers, preset));
    }
    return preset;
  }

  resolvePreset(defaultPresetName) {
    return this.getPresets()[defaultPresetName];
  }

  resolveFinalPrompts() {
    /* 所有后续插入的选项都需要保证手工选择下才可以使用 */
    this.injectedPrompts.forEach((prompt) => {
      // 先拿到原始的wehen方法 用户传递了就用用户的 否则就返回true
      const originalWhen = prompt.when || (() => true);
      // 重写when方法 函数劫持
      prompt.when = (answers) => {
        // 必须在手动选择的状态下才允许弹出 不是手动的不弹出
        return isManualMode(answers) && originalWhen(answers);
      };
    });

    const prompts = [
      this.presetPrompt, // 先弹出预设
      this.featurePrompt, // 在弹出特性
      ...this.injectedPrompts, // 弹出特性的细粒度选项 可能会有多个
    ];

    return prompts;
  }
  /**
   * 获取默认要添加的预设 也就是脚手架要工作的最小环境
   * 如果没有默认的预设 工具是无法工作的
   */
  getPresets() {
    // 这里省略了去系统中获取.vuerc配置文件的信息 最终的结果就是把两者合并 并且加了缓存
    let vueRcOptions = {};
    return Object.assign({}, vueRcOptions, defaults.presets);
  }

  resolveIntroPrompts() {
    const presets = this.getPresets();

    /* 预设选项是选择Vue2还是Vue3 */
    const presetChoices = Object.entries(presets).map(([name, preset]) => {
      let displayName = name;
      if (name === "default") {
        displayName = "Default (Vue 2 babel eslint)";
      } else if (name === "__default_vue_3__") {
        displayName = "Default (Vue 3 babel eslint)";
      }

      return {
        name: `${displayName}`,
        value: name,
      };
    });

    /* 
        弹出用户选择框：
        1. Default (Vue 2)
        2. Default (Vue 3)
        3. Manually select features
    */
    const presetPrompt = {
      name: "preset",
      type: "list",
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices,
        {
          name: "Manually select features(手工个性化选择)",
          value: "__manual__",
        },
      ],
    };

    /* 
        用户手工选择的特性多选框
        * babel
        * eslint
        * TypeScript
        * Progressive Web App (PWA) Support
        * Router
        * Vuex
        * CSS Pre-processors
        * Linter / Formatter
        * Unit Testing
        * E2E Testing
        * 
    */
    const featurePrompt = {
      name: "features",
      // when: isManualMode, // 返回值为true才弹出 否则不执行
      when: (answers) => answers.preset === "__manual__",
      type: "checkbox",
      message: "Check the features needed for your project:",
      choices: [],
      pageSize: 10,
    };

    return {
      presetPrompt,
      featurePrompt,
    };
  }
}

module.exports = Creator;
