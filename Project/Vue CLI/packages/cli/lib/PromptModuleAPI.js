module.exports = class PromptModuleAPI {
  constructor(creator) {
    this.creator = creator;
  }

  /* 往featurePrompt中的choces中插入一个选项 */
  injectFeature(feature) {
    this.creator.featurePrompt.choices.push(feature);
  }

  /* 插入一个新的弹出选项 */
  injectPrompt(prompt) {
    this.creator.injectedPrompts.push(prompt);
  }

  injectOptionForPrompt(name, option) {
    this.creator.injectedPrompts
      .find((f) => {
        return f.name === name;
      })
      .choices.push(option);
  }

  /* 选择完成的回调 会依次收集起来 */
  onPromptComplete(cb) {
    this.creator.promptCompleteCbs.push(cb);
  }
};
