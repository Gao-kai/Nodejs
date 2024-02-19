/****
 *
 * 
module.export = 100;
exports.a = 200;
最终导出的是100 因为模块加载最后导出的是module.exports指向的值

module.exports = 100;
exports = 200
最终导出的是100 这里exports指向的地址变了
 *
所以模块的导出：
this.xxx = xxx;
module.exports = {xxx}
exports.xxx = xxx;

不能是：
exports = xxx

只要修改了exports的指向 那么就会导致和原来module.exports的引用的切换

commonjs导入的是模块值的复制  也就是module.exports的那个对象 函数执行return的对象
后续哪怕模块内部的值变了 比如定时器
读取到的是原来模块的值

注意缓存的是module而不是module.exports
只要原来模块的module.exports变化 此时去重新加载模块 也就是重写执行函数 那么加载到的结果也会变化

循环引用的解决方案就是不循环引用 否则只会加载部分内容

1. require语法是同步加载的
2. require函数返回的是一个对象 module.exports
3. module.exports和exports引用相同地址的变量
4. 模块是动态加载的 所以require可以条件引入 每次加载都会获取最新导出的结果
5. 缓存的是module不是module.exports
6. 循环引用需要修改写法 只会部分加载

 *
 */


const path = require("path");
const fs = require("fs");
const vm = require("vm");

function Module(id) {
  this.id = id;
  this.exports = {};
}

Module.wrap = function(script){
    const arr = [
        "(function(exports,require,module,__filename,__dirname){",
        script,
        "})"
    ]

    return arr.join("");
}

Module._extensions = {
  ".js": function (module) {
     // 读取文件
     const content = fs.readFileSync(module.id,'utf-8');
     let fnStr = Module.wrap(content);
     let fn = vm.runInThisContext(fnStr);

    //  console.log(fn.toString());

     let require = muRequire;
     let exports = module.exports;
     let __filename = module.id;
     let __dirname = path.dirname(module.id)

    //  这里的this就是exports对象 这也解释了在一个空模块中打印一句this返回的是一个{} 原因就是这里的this是exports 而模块的exports是一个空对象
    // 所以this.x module.exports={x} exports.x 这三个写法其实是一个意思
     fn.call(exports,exports,require,module,__filename,__dirname);
    //  函数执行完成之后 module.exports通过参数传递已经有了属性
    
  },
  ".json": function (module) {
    // 读取文件
    const content = fs.readFileSync(module.id);
    // 挂载module.exports
    module.exports = JSON.parse(content);
  },
};

Module.prototype.load = function (resolvePath) {
  // 获取文件的后缀
  let extName = path.extname(resolvePath);
  // 基于不同的后缀加载不同的策略
  Module._extensions[extName](this);
};

function muRequire(filePath) {
  return Module._load(filePath);
}

function isFileExist(filePath) {
  return fs.existsSync(filePath);
}

Module.cache = {};

Module._load = function (filePath) {
  try {
    // 必须获取到绝对路径 因为不同文件夹中有可能文件重名
    let resolvePath = Module._resolveFilename(filePath);
    console.log("resolvePath", resolvePath);

    // 拿到路径不立即创建模块 而是先查询缓存
    let moduleCache = Module.cache[resolvePath];
    if(moduleCache){
        // 模块的exports属性就是模块导出的结果
        return moduleCache.exports
    }

    // 拿到唯一path 创建模块
    let module = new Module(resolvePath);

    // 将已经创建好的模块和cache关联起来
    Module.cache[resolvePath] = module;

    // 加载模块 这一步完成module.export的挂载
    module.load(resolvePath);

    // 返回结果
    return module.exports;

  } catch (error) {
    console.error(error);
  }
};


Module._resolveFilename = function (filePath) {
  let absPath = path.resolve(__dirname, filePath);
  let isExist = isFileExist(absPath);
  if (isExist) return absPath;

  let extensions = Object.keys(Module._extensions);
  for (let i = 0; i < extensions.length; i++) {
    let currPath = absPath + extensions[i];
    if (isFileExist(currPath)) {
      return currPath;
    }
  }

  throw new Error("FILE IS NOT EXIST!!!");
};

console.log("a模块的文件是", muRequire("./a.js"));
muRequire("./a.js")
muRequire("./a.js")
muRequire("./a.js")
