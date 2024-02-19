const path = require("node:path");
const MagicString = require("magic-string");
const acorn = require("acorn");
const analyse = require("../ast/analyse");
const { hasOwnProperty } = require("../utils/object");

/**
 * 一个文件就是一个模块 每一个模块都包含：
 * 1. magicString 基于模块源代码字符串包装的字符串操作对象
 * 2. 路径
 * 3. 打包对象
 * 4. ast
 */
class Module {
  constructor({ code, path, bundle }) {
    this.magicString = new MagicString(code, {
      filename: path,
    });
    this.path = path;
    this.bundle = bundle;
    this.ast = acorn.parse(code, {
      ecmaVersion: 8,
      sourceType: "module",
    });
    this.analyse();
  }

  //   这一步会给每一个ast的语句上添加_source 这个source的值就是原始code的魔法字符串
  analyse() {
    // 所有导入依赖图
    this.imports = {};

    // 所有导出依赖图
    this.exports = {};

    // 所有修改的
    this.modifications = {};

    // 遍历ast 依赖图进行记录
    this.ast.body.forEach((node) => {
      // 说明是导入声明语句
      if (node.type === "ImportDeclaration") {
        // ast节点上获取到导入源 ./xxx.js
        let source = node.source.value;
        // 获取所有导入的标志符
        let specifiers = node.specifiers;

        specifiers.forEach((specifier) => {
          // 导入变量名
          const importedName = specifier.imported.name;
          // 导入之后重命名的变量名 x as newName
          const localName = specifier.local.name;
          this.imports[localName] = {
            importedName,
            localName,
            source,
          };
        });
      } else if (node.type === "ExportNamedDeclaration") {
        // 具名导出 export const age = 100
        let declaration = node.declaration;
        if (declaration.type === "VariableDeclaration") {
          const identifier = declaration.declarations[0].id.name;
          // 记录当前模块的导出 localName就是导出时的名称
          this.exports[identifier] = {
            node,
            localName: identifier,
            expression: declaration, // 表示导出的变量是那个声明节点生成的
          };
        }
      } else if (node.type === "ExportAllDeclaration") {
        // 全量导出 export * as name from
      } else if (node.type === "ExportDefaultDeclaration") {
        // 默认导出 export default {}
      }
    });

    // 进行模块间变量的分析
    analyse(this.ast, this.magicString, this);

    // 存放所有模块顶级变量的定义语句 key是变量名称 value是对应的ast语句对象
    // 如果后续有其他模块也导入了当前变量 那么就将这个语句直接拿过去
    this.definitions = {};
    this.ast.body.forEach((statment) => {
      Object.keys(statment._defines).forEach((name) => {
        this.definitions[name] = statment;
      });
      // 记录修改语句
      Object.keys(statment._modifies).forEach((name) => {
        if (!Object.prototype.hasOwnProperty(this.modifications, name)) {
          this.modifications[name] = [];
        }
        this.modifications[name].push(statment);
      });
    });
  }

  //   把语句中定义的变量的额语句都拿过来 放到结果里  没用的摇了
  expandAllStatements() {
    let allStatments = [];
    this.ast.body.forEach((statment) => {
      // 注入impoer xxx 的导入语句不需要出现再最终的产物中了 tree-shaking核心 如果一个变量仅仅在导入语句的_dependsOn上存在
      // 在其他语句的_dependsOn不存在 此时这个变量并不会去找他的定义 也就是不会将源码赋值过来 加入到allStatments中 这不就将这个没有使用的变量摇晃掉了吗
      if (statment.type === "ImportDeclaration") return;
      let statments = this.expandStatement(statment);
      allStatments.push(...statments);
    });
    return allStatments;
  }

  /**
   * 1. 找到当前语句内部访问的变量
   * 2. 找到变量的声明语句
   * 3. 语句声明可能当前模块 也可能在其他模块导入的
   * @param {*} statment
   */
  expandStatement(statment) {
    statment._include = true;
    let result = [];
    // 获取外部依赖
    const dependencies = Object.keys(statment._dependsOn);
    // 递归的去找这个外部依赖到底哪里导出来的 找到定义的语句 然后push进来
    dependencies.forEach((name) => {
      // 找到定义这个顶级模块变量的声明节点 可能在当前模块内 也可能在外部依赖模块
      let definition = this.define(name);
      result.push(...definition);
    });

    // if (!statment._include) {
    // 一个变量被甚多模块导入并且使用了 这个变量只需要添加一次就好了 避免重复添加
    // 同一作用域中对于变量的多次访问 也只天机啊一次
    // tree-shaking的核心在这里
    result.push(statment);
    // }

    const defines = Object.keys(statment._defines);
    defines.forEach((name) => {
      // 当前全局变量出现在修改语句中 获取被修改的变量的所有修改语句
      const modifications =
        hasOwnProperty(this.modifications, name) && this.modifications[name];

      // 遍历所有修改了变量的语句 找到修改的地方 然后复制过来
      if (modifications) {
        modifications.forEach((statment) => {
          if (!statment._included) {
            let statements = this.expandStatement(statment);
            result.push(...statements);
          }
        });
      }
    });

    return result;
  }

  define(name) {
    // 如果是导入的才去找 不是导入的你还用  直接报错就好了
    if (hasOwnProperty(this.imports, name)) {
      const importData = this.imports[name];

      // 获取导入的路径 比如import myName from './a.js' 这个./a.js就是source
      const { source, importedName } = importData;

      // 获取bundle实例 上面有fetchModule方法基于路径生成对应模块的实例
      // source = a.js  this.path = 绝对路径的main.js
      // 拿到a模块实例
      const module = this.bundle.fetchModule(source, this.path);

      // 先查询下人家a模块内部真的导出了你要导入的变量了吗
      const exportData = module.exports[importedName];

      // 找到导出的变量名
      const exportLocalName = exportData.localName;

      // 递归进行模块加载 也就是去执行a模块的define方法
      return module.define(exportLocalName);
    } else {
      // 找到定义的语句
      let statment = this.definitions[name];
      if (statment && !statment._include) {
        // 基于收集语句 看此语句内部是否有其他定义但来自其他模块的变量
        return this.expandStatement(statment);
      } else if (["console", "log"].includes(name)) {
        return [];
      } else {
        throw new Error(
          `变量${name}没有既没有从外部导入，也没有在当前模块内声明！`
        );
      }
    }
  }
}

module.exports = Module;
