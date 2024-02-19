const defaultPreset = {
  useConfigFiles: false,
  cssPreprocessor: undefined,
  plugins: {
    "@vue/cli-plugin-babel": {}, // 默认加载官方的babel的插件
    "@vue/cli-plugin-eslint": {
      // 默认加载官方的eslint插件
      config: "base",
      lintOn: ["save"],
    },
  },
};

/* 基于上面的默认预设添加版本号 */
const defaults = {
  packageManager: undefined, // 包管理器
  useTaobaoRegistry: undefined, // 是否使用淘宝源
  presets: {
    default: Object.assign({ vueVersion: "2" }, defaultPreset),
    __default_vue_3__: Object.assign({ vueVersion: "3" }, defaultPreset),
  },
};

module.exports = {
  defaults,
};
