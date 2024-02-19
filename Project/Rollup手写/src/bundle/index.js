const fs = require("node:fs");
const path = require("node:path");
const Module = require("../module");
const MagicString = require("magic-string");

/**
 * Bundle实例包含：
 * 1. entryPath 入口文件的绝对路径
 * 2. modules 基于入口文件查询出来的所有文件模块的Module实例对象集合 key为文件名 value为实例值
 * 3. 当前实例的所有ast语句
 *
 * 核心是build方法
 * 1. 基于入口模块路径生成一个入口模块实例entryModule 实例包含code path和bundle
 * 2. 调用entryModule的expandAllStatements方法 遍历ast 将所有语句进行合并
 * 3. 基于所有语句生成产物 写入磁盘
 */
class Bundle {
  constructor(options) {
    // 防止用户传入的入口文件绝对路径没有后缀 比如 src/main 做兼容性配置
    this.entryPath = options.entry.replace(/\.js$/, "") + ".js";
    this.modules = Object.create(null);
    this.statements = [];
  }

  /**
   * @description 从入口文件开始编译模块 将所有关联的模块编译为一个个的Module实例
   * @param {*} outputFileName
   */
  build(outputFileName) {
    // 从入口文件的绝对路径出发找到模块定义
    let entryModule = this.fetchModule(this.entryPath);

    // 把这个入口模块的所有语句进行展开 返回所有的语句组成的数组
    this.statements = entryModule.expandAllStatements();

    // 生成产物 写入磁盘
    const { code } = this.generate();
    fs.writeFileSync(outputFileName, code, "utf-8");
  }

  /**
   * @description 查询目标模块并返回模块实例
   * @param {*} importee 表示要加载的目标模块的路径 可以相对或者绝对路径
   * @param {*} importer 表示是那个模块加载目标模块 是基础路径的意思 加载入口模块是为null
   */
  fetchModule(importee, importer) {
    let route = null;

    // 如果importer为null 代表是加载入口模块main.js 此时直接加载即可
    if (!importer) {
      route = importee;
    } else {
      // 如果加载的目标模块不是入口模块 但也是一个绝对路径 那么直接加载绝对路径即可
      if (path.isAbsolute(importee)) {
        route = importee;
      } else if (importee[0] === ".") {
        // 如果加载的目标模块不是入口模块 但是一个相对路径 此时需要去拼接路径
        // 首先获取基础导入路径也就是main.js文件所在的目录名 这里就是src
        // 然后将目录名和目标模块路径进行拼接 得到 src/xxx.js的绝对路径
        const dirname = path.dirname(importer);
        route = path.resolve(dirname, importee.replace(/\.js$/, "") + ".js");
      }
    }
    if (route) {
      // 读取入口文件源代码的代码字符串
      let code = fs.readFileSync(route, "utf-8");
      //  生成module实例
      let module = new Module({
        code, // 模块源代码
        path: route, // 模块路径? importee
        bundle: this, // 模块所属bundle
      });
      //   返回
      return module;
    }
  }

  generate() {
    const bundle = new MagicString.Bundle();
    this.statements.forEach((statement) => {
      const source = statement._source.clone();
      /* 
        生成代码的时候就不需要变量定义处的export关键字了
        源码是：export const name = 100
        最后：const name = 100 不要export
       */
      if (/^Export/.test(statement.type)) {
        if (
          statement.type === "ExportNamedDeclaration" &&
          statement.declaration.type === "VariableDeclaration"
        ) {
          source.remove(statement.start, statement.declaration.start);
        }
      }
      bundle.addSource({
        content: source,
        separator: "\n",
      });
    });
    return {
      code: bundle.toString(),
    };
  }
}

module.exports = Bundle;
