module.exports = {
  presets: [
    "@babel/preset-env", // 最后解析js 将js做es6转换
    "@babel/preset-typescript", // 先解析ts语法将其解析为js
  ],
  /**
   * 为什么要做overrides？
   * 因为基于webpack的配置babel-loader只会对js ts 和tsx的文件进行转译
   * 但是对于.vue的文件走的是vue-loader vue-loader只负责对于SFC单文件的解析
   * 人家可没有说要进行ts的校验和将ts转化为js这一工作
   * 所以这边需要overrides下 当遇到.vue文件的时候 babel-loader还需要对vue文件中的代码做一次transform-typescript
   * @babel/transform-typescript插件不执行类型检查 只做ts到js的转译
   * 会合并webpack中的.vue文件的loader配置
   *
   * 那么为什么不直接写在webpack config js中的呢 原因就是可能多个构建工具如webpack rollup等都用到babel
   * 都会来读取babel.config.js
   * 写在这里 只要用babel 在解析.vue文件的时候就会读取到这个配置 避免多次重复写
   */
  overrides: [
    {
      test: /\.vue$/,
      plugins: ["@babel/transform-typescript"],
    },
  ],
  // env: {
  //   utils: {
  //     plugins: [
  //       [
  //         "babel-plugin-module-resolver", // 为了能正确找到g-ui模块
  //         { root: "g-ui" },
  //       ],
  //     ],
  //   },
  // },
};
