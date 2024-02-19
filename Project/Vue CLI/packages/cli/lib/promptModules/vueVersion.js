const handleVueVersion = (cli) => {
  /* 插入新的特性 */
  cli.injectFeature({
    name: "Choose Vue version",
    value: "vueVersion",
    description:
      "Choose a version of Vue.js that you want to start the project with",
    checked: true,
  });

  /* 插入新的弹出选项 */
  cli.injectPrompt({
    name: "vueVersion",
    when: (answers) => answers.features.includes("vueVersion"),
    message:
      "Choose a version of Vue.js that you want to start the project with",
    type: "list",
    choices: [
      {
        name: "2.x",
        value: "2",
      },
      {
        name: "3.x",
        value: "3",
      },
    ],
    default: "2",
  });

  /* 提示框选择完成之后的回调 */
  cli.onPromptComplete((answers, options) => {
    if (answers.vueVersion) {
      options.vueVersion = answers.vueVersion;
    }
  });
};

module.exports = handleVueVersion;
