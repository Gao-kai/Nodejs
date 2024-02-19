const path = require("node:path");
const rollup = require("./lib/rollup");

// 入口文件的绝对路径 "C:\\Users\\克林辣舞\\Desktop\\rollup-handwrite\\src\\main.js"
const entry = path.resolve(__dirname, "src/main.js");

// 调用rollup执行打包
rollup(entry, "./bundle.js");
