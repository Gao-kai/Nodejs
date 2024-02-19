/**
 * 使用webpack打包组件库为umd格式
 * 从packages/g-ui/index.ts入口 将资源打包成为umd的产物放在package/lib目录下
 */
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "../packages/g-ui/index.ts"),
  output: {
    path: path.resolve(__dirname, "../lib"),
    filename: "index.js",
    libraryTarget: "umd",
    library: "g-ui",
  },
  externals: {
    // 排除vue打包 因为使用组件的人肯定会在根目录下安装vue 写源码的时候假设引入了vue的代码我们都不打包 不可能每个组件都打包一次vue的核心代码 vue交给用户注入
    vue: {
      root: "Vue",
      commonjs: "vue",
      commonjs2: "vue",
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  plugins: [new VueLoaderPlugin()],
};
