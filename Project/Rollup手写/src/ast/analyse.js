const Scope = require("./scope");
const { walk } = require("./walk");

/**
 * @description
 * 1. 分析当前的模块使用到了那些变量
 * 2. 分析那些变量是当前模块声明的
 * 3. 分析那些变量是导入别的模块的
 * @param {*} ast 模块ast
 * @param {*} magicString 模块源码包装字符串对象
 * @param {*} module 模块实例本身
 */
function analyse(ast, magicString, module) {
  let scope = new Scope();

  // 第一次遍历：遍历顶级接待您
  ast.body.forEach((statment) => {
    /**
     * @description 给模块作用域添加变量
     * @param {*} declaration 声明语句节点对象
     * @param {*} isBlockDeclaration 是否为块级作用域声明
     */
    function addToScope(declaration, isBlockDeclaration = false) {
      // 获取声明的变量名
      const identifier = declaration.id.name;

      // 将变量添加到当前的作用域中
      scope.add(identifier, isBlockDeclaration);

      // 如果已经在顶级作用域中了 那么记录到顶级作用域变量中
      if (scope.parent == null) {
        statment._defines[identifier] = true;
      }
    }

    // 给当前遍历的节点添加一些属性
    Object.defineProperties(statment, {
      // 记录当前节点的源代码字符串
      _source: {
        value: magicString.snip(statment.start, statment.end),
      },
      // 记录当前模块定义的所有顶级作用域变量
      _defines: {
        value: {},
      },
      // 记录当前模块么有定义但是用到了的变量 也就是导入来自外部的变量
      _dependsOn: {
        value: {},
      },
      // 记录当前语句是否已经处理过了 避免重复处理
      _included: {
        value: false,
        writable: true,
      },
      // 记录当前语句是否修改了某个变量
      _modifies: {
        value: {},
      },
    });

    // 遍历节点 每次进入和离开前都处理下作用域
    walk(statment, {
      enter(node) {
        let newScope = null;

        switch (node.type) {
          // 函数声明
          case "FunctionDeclaration":
            const params = node.params.map((item) => item.name);

            addToScope(node);

            // 创建一个函数作用域
            newScope = new Scope({
              params: params, // 函数参数就是当前作用域的变量
              parent: scope, //父作用域就是当前作用域
              block: false, // 函数声明不是块级作用域
            });
            break;

          case "BlockStatement":
            newScope = new Scope({
              parent: scope,
              block: true,
            });
            break;

          // 变量声明
          case "VariableDeclaration":
            node.declarations.forEach((declaration) => {
              if (node.kind === "let" || node.kind === "const") {
                addToScope(declaration, true);
              } else {
                addToScope(declaration, false);
              }
            });

          default:
            break;
        }

        // 如果当前节点生成了一个新的作用域 那么在这个节点上记录下
        if (newScope) {
          Object.defineProperty(node, "_scope", {
            value: newScope,
          });
          // 作用域由外向里
          scope = newScope;
        }
      },
      leave(node) {
        // 如果进入节点的时候产生了作用域 那么离开时要回到父作用域 由里向外
        if (node._scope) {
          scope = scope.parent;
        }
      },
    });
  });

  // 第二次遍历 查询外部变量 tree-shaking的基础在这里
  ast.body.forEach((statment) => {
    // 读取变量
    function checkForReads(node) {
      if (node.type === "Identifier") {
        // 找到变量名
        const identifier = node.name;

        // 在作用域链上查询变量名 如果查询到了说明当前作用域定义过了 没查到说明是外部定义的
        /**
         * 只要找到一个变量 就先在作用域中找
         * 如果找到了 说明自己模块内部就定义好了
         * 如果找不到 说明模块内部没有定义 应该是外部模块导入的
         */
        const defineScope = scope.findDefiningScope(identifier);

        // 链上没有找到 此时将这个变量先记录为外部依赖 比如没有使用的age变量
        if (!defineScope) {
          statment._dependsOn[identifier] = true;
        }
      }
    }

    // 修改变量
    function checkForWrites(node) {
      // 记录那些变量被修改了
      function addNode(node) {
        while (node.type === "MemberExpression") {
          node = node.object;
        }
        if (node.type !== "Identifier") return;
        statment._modifies[node.name] = true;
      }

      // 赋值语句 拿到node的左侧 也就是被复制的变量
      if (node.type === "AssignmentExpression") {
        // 赋值 a=200 a+=200
        addNode(node.left, true);
      } else if (node.type === "UpdateExpression") {
        addNode(node.argument, true);
      }
    }

    walk(statment, {
      enter(node) {
        // 如果节点有scope属性 说明这个节点会形成一个新的作用域 那么切换到函数作用域
        if (node._scope) {
          scope = node._scope;
        }

        // 只要是标识符有关的节点都进行查询
        checkForReads(node);
        checkForWrites(node);
      },
      leave(node) {
        // 如果进入节点的时候产生了作用域 那么离开时要回到父作用域 切换作用域
        if (node._scope) {
          scope = scope.parent;
        }
      },
    });
  });
}

module.exports = analyse;
