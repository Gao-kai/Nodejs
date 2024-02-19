const path = require("path");
const fs = require("fs").promises;

function resolvePath(root, name) {
  return path.resolve(
    root,
    "node_modules",
    `@vue/${name}/dist/${name}.esm-bundler.js`
  );
}

function makeVuePackgesMapping(root) {
  // .vue文件模板编译包是@vue/compiler-sfc 读取其package json文件的main字段入口文件
  const compilerPkgPath = path.resolve(
    root,
    "node_modules",
    "@vue/compiler-sfc/package.json"
  );
  const compilerPackageJSON = require(compilerPkgPath);
  const compilerPath = path.join(
    path.dirname(compilerPkgPath),
    compilerPackageJSON.main
  );

  // dom运行时
  const runtimeDomPath = resolvePath(root, "runtime-dom");

  // 核心运行
  const runtimeCorePath = resolvePath(root, "runtime-core");

  // 响应式模块
  const reactivityPath = resolvePath(root, "reactivity");

  // 共享模块
  const sharedPath = resolvePath(root, "shared");

  return {
    vue: runtimeDomPath,
    "@vue/runtime-dom": runtimeDomPath,
    "@vue/runtime-core": runtimeCorePath,
    "@vue/reactivity": reactivityPath,
    "@vue/shared": sharedPath,
    compiler: compilerPath,
  };
}

module.exports = makeVuePackgesMapping;
