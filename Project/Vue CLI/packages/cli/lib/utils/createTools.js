/**
 * @description 获取脚手架预设
 * @returns 有多个函数组成的数组
 */
const getPromptModules = () => {
  return [
    "vueVersion",
    // "babel",
    // "typescript",
    // "pwa",
    // "router",
    // "vuex",
    // "cssPreprocessors",
    // "linter",
    // "unit",
    // "e2e",
  ].map((file) => require(`../promptModules/${file}`));
};

module.exports = getPromptModules;
