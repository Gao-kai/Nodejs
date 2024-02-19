# 手写实现 Rollup

## 前置知识

1. magic-string 字符串截断与拼接
2. acorn 提供源码解析为 ast 并且进行遍历
3. scope 作用域 实现 tree-shaking

## 实现什么

1. 导出一个 rollup 对象，上面有一个 rollup 函数 执行此函数会返回一个 promsie 并且会将打包的结果 bundle resolve 出去 此时 bundle 会在内存中
2. bundle 产物上有 generate 方法可以生成 code 和 sourcemap 此时我们可以用 fs 的 api 进行写入
3. bundle 产物上还有 write 方法可以直接写入磁盘

## VS Webpack

打包非常干净 没有冗余的代码

## tree-shaking

```js
import { name, age } from "./person.js";
import { home } from "./city";
function say() {
  console.log(`my name is ${name},my age is ${age} and my home is ${home}`);
}
say();
```

1. 找变量
   入口模块出发，找到所有被访问的变量，注意这里不是定义的变量，而是要访问的变量

2. 找位置
   找到上述每一个访问的变量定义的位置，可能在当前模块，也可能来自其他模块

3. 摇树
   无关的代码一律抛弃

4. 只支持 es module 因为是静态导入 代码还没有执行就可以分析出模块之间的依赖关系

ExportNamedDeclaration
ExportAllDeclaration
ExportDefaultDeclaration

# 断点流程分析

我们的目标是将如下代码，导入了 name 和 age
声明了 say 但是我们只用到了 name 变量
要将 age 摇了：

```js
import { name, age } from "./person.js";

function say(a, b) {
  console.log(`my name is ${name}`);
}

say();
```

产物：

```js
const name = "lilei";

function say(a, b) {
  console.log(`my name is ${name}`);
}

say();
```

## 执行 rollup 方法

rollup(entry, "./bundle.js");
entry 的值是绝对路径：path.resolve(\_\_dirname, "src/main.js");
输出目录是相对路径

1. 执行 new Bundle 方法 创建一个 bundle 对象 偏向产物
   每一个 bundle 实例都有三个属性：

- entryPath 入口文件的路径 以.js 结尾
- modules 所有基于入口文件的路径找到的模块实例对象集合
- statements 所有 ast 节点语句

2. 执行 bundle.build 传入输出路径 outputFileName

- 首先基于入口文件 执行 fetchModule 方法 这一步是基于路径读取文件 并且生成一个 Module 实例

- 然后调用模块实例 module 的 expandAllStatements 方法
  因为一个模块中可能会有多个 import 导入
  导入语句中还可能有导入语句
  所以需要一层层的去找在当前模块中导入的变量名称
  最终的结果是形成

3. 执行 bundle 打包器的 generate 方法 生成产物
   而产物的来源就是上一步展开之后收集的所有 ast 语句节点
   遍历这些节点 取出 source 源码
   然后拼接字符串

4. 写入磁盘

那么重点来了，打包器对象的核心就是：

1. 生成模块实例
2. 基于模块实例递归查找变量的来源模块
3. 组合语句 遍历语句 打包语句

## Bundle fetchModule 方法

### 定位模块路径

1. 参数 importee
   首次执行一定是入口文件绝对路径
   C:\Users\克林辣舞\Desktop\rollup-handwrite\src\main.js
   绝对路径可以直接定位

后续假设 main 中导入了其他模块比如 person.js
那么 importee 就是'./person.js'

反正第一个参数始终指向目标要读取的模块路径 可能是绝对 可能是相对

2. 参数 importer
   首次执行一定是 null 因为传入的入口文件路径是相对路径 就不需要基础路径了
   后续假设 main 中导入了其他模块比如 person.js
   那么 importer 就是指的谁导入的你 这里就是 C:\Users\克林辣舞\Desktop\rollup-handwrite\src\main.js
   表示是 main.js 模块导入了 person.js 模块

这里的目的就是得到一个绝对路径 来定位到磁盘中的文件

### 然后读取源代码

### 最后生成 new Module

## Module

### 构造器函数

- code 模块内部写的代码字符串
- path 当前模块的绝对路径 还是相对路径
  C:\Users\克林辣舞\Desktop\rollup-handwrite\src\person.js
  ./person.js
- bundle 把这个 bundle 实例的引用传递过去 后续分析到模块内部有 import 语句的时候需要调用 fetchModule 方法
  继续加载其他模块 而加载模块又会返回新模块的 Module 对象 这里就是一个递归
- magicString 对源码的包装
- ast 基于源码产生的 ast 抽象语法树
- definitions 模块内部定义的顶级变量
  来源可能是顶部声明的变量 const var let import{}
  还可能是函数声明 function(){}
  它的形式是 key 是顶级变量名称 值是该产生该变量的 ast 声明节点
- imports 导入的变量 map
- exports 导出的变量 map

### analyse 分析模块 核心

#### 1. 先遍历一遍模块的 ast 将模块内导入和导出的变量记录到 imports 和 exports 上

- node.type === "ImportDeclaration" 说明是导入语句
  这种 node 的 source 对象上的 value 保存着导入的来源 "value": "./person.js",
  node 的 specifiers 数组中保存所有导入的变量

  可以清晰的知道导入的变量叫什么 从哪个文件导入进来的
  importedName
  localName
  source

- 然后处理导出语句
  导出语句的 declaration 上保存这个一个节点
  这个节点的 declarations 的中可以找到导出的变量

localName 保存导出的变量叫什么 localName = name1
node 保存一个导出语句的 ast 节点 node = ExportNamedDeclaration
expression 保存一个导出语句中声明导出变量的节点 expression = VariableDeclaration

可以清晰的知道来自哪个 export 语句 内部的节点声明语句 变量名称叫什么 localName

#### 2. 核心 analyse 工作

1. 声明一个模块顶级作用域

```js
let scope = new Scope();
this.scopeName = options.scopeName;
undefined;
this.parent = options.parent;
undefined;
this.identifiers = options.params || [];
[];
```

2. 第一轮遍历 ast 节点
   每一个节点进入前先声明一个局部变量 newScope 用于作用域切换

每一个节点都有四个新增的属性：

- \_source 代表该语句对应的源码
- \_defines 当前语句内部产生的顶级作用域变量
- \_dependsOn 当前语句用到了的变量 但是自己查了作用域链查不到 是外部导入的变量
- \_included 当前语句是否已经遍历过了

然后基于节点类型进行判断

- 如果是函数声明节点

那么首先取出函数参数 参数就是局部作用域声明的变量

- 执行 addToScope(node);
  当前节点是一个声明 取出声明的变量名称比如 say
  将其添加到顶级作用域上 scope.add('say');
  看下当前作用域切换没有
  如果还是顶级作用域 那么给当前节点的\_defines 对象上添加 say 属性 值为 true
  表示此时捕获到一个模块内部的顶级变量
- 创建一个函数局部作用域

newScope = {
parent：上一级自己的 scope 实例
identifiers：函数参数数组

}

- 如果是变量声明语句
  遍历语句的声明 找到声明变量语句节点 declaration
  执行 addToScope(node);
  将声明的变量添加到作用域
  如果是顶级变量 还需要在 statment 上给\_defines 赋值

然后判断是否发生了作用域切换：
如果切换了 那么此时给当前遍历的节点 Node 上添加一个\_scope 的值是作用域对象 便于后续查找
执行作用域切换 scope = newScope;

因为 walk 是一个递归深度遍历的过程
会将一个 node 中的只要值是对象并且带有 type 的属性都进行遍历
Node 是很深的节点
statment 是一个语句 是顶层的 ast Node

总结：
这一轮是吧整个 ast 遍历了一遍
遍历的过程中收集每一个声明语句 包含函数声明和普通声明
然后创建作用域链
给创建了局部作用域的节点上添加一个\_scope 属性 值就是当前的局部作用域实例 便于后续查找
并且如果某个变量是顶级变量 那么记录到顶级语句节点的\_defines 对象上

3. 开始第二轮遍历
   进入节点前先看下此节点是否是局部作用域
   如果是 切换作用域

只要 type === Identifier 说明和变量有关
此时在当前作用域上查这个变量 如果查到会返回 scope 实例
查不到说明此模块内部没有自己声明 拿不就是外部声明然后导入的吗

如果是外部导入的变量 记录到顶级语句节点的\_dependsOn 对象上

## 模块分析结束：

我们来看看此时分析了那些东西：

每一个模块上都有：

- imports 导入
- exports 导出
- ast
  每一个 ast 顶级节点上都有四个属性：
- \_source 代表该语句对应的源码
- \_defines 当前语句内部产生的顶级作用域变量
- \_dependsOn 当前语句用到了的变量 但是自己查了作用域链查不到 是外部导入的变量
- \_included 当前语句是否已经遍历过了

除此之外有些 Node 节点上比如函数声明节点上还有\_scope 属性指向自己创建的函数作用域

- definitions
  从顶级语句节点中找到\_defines 属性 找出这些顶级变量 然后添加到模块的 definitions 定义者们上

## 将 module 返回

但是此时只拿到了根模块的 module 你其他模块的还需要找
执行 module 的 expandAllStatements 方法
展开所有导入语句
将所有导入到本模块内部的变量声明语句 statment 都放到一个数组中

## expandStatement 方法

Import 语句 会在展开的时候被排除掉
因为这里需要将哪些依赖的外部变量找到

- 先将顶级语句的\_include 变为 true
- 拿到所有用到了但是没有在自己内部定义的变量
  {
  \_dependsOn：{
  name,age
  }，
  函数声明语句
  \_dependsOn：{
  name 不是自己定义的 但是用了
  }，
  函数调用语句
  say 用到了 自己定义的
  }

## define 方法

参数是变量名称 意思就是找这个外部变量的定义语句
拿到 放到 result 中
最终一定返回一个数组 这是递归的必须条件

1. 先看是不是当前模块导入的 不是的话就报错
2. 如果是 那么起码要知道 importedName 和 source 也就是路径
3. 基于当前模块路径和 source 来 fetchModule 新的目标模块
   前面说过 加载模块就是先做一个绝对路径
   然后读取源代码字符串
   然后 new 一个新的 Module 对象 然后返回
   在 new Module 的时候自然要对醒模块进行分析 分析新模块的导入 导出 作用域等
   然后返回新的 module 实例

新的 module 上就有 exports 属性
先看看你导入的是不是人家导出的 人家有你要的变量但是人家没导出也不行
exportLocalName

4. 这一步在新模块中找到了导出的变量名
   但是这个变量名也有可能是 c 模块导入的呀 怎么办
   继续 define 呗

b 模块中是否导入了这个变量
如果导入了 再去 c 模块找定义
如果没有导入
那么在模块分析的时候 模块的 definitions 上保存着当前模块的所有顶级变量
因为只有顶级声明才可以导出
先找到这个导出的变量对应的 ast 语句
如果这个 ast 语句存在 并且\_include 也就是没有呗重复导入过
此时返回当前模块的 expandStatement 语句展开

否则返回一个空数组

```js
// main.js
import foo from "./a.js";
import { b } from "./c.js";

// a.js
import { b } from "./c.js";
export default function foo() {
  const a = 100;
  return a + b;
}

// c.js
export const b = 200;
```

main.js 中执行 expandAllStatements 执行每一个 expandStatement
foo 来自 a 模块
分析 a 模块
a 模块中倒是有 foo 的导出 但是 foo 又依赖了 c 模块
再去分析 b 此时 b 语句已经 include 了 说明之前分析过了
那么不用管
如果没有分析过 那么需要找到 b 的定义语句
拿过来放到函数 foo 语句的最顶部
b 来自 c 模块
将 b 拿过来 放到 main 的顶部

# 为什么 rollup 不能用 cjs

因为人家源码在处理 ast 的时候
只对 Import Export 语句做了处理
你这种 module.exports 会被 ast 处理为 ExpressionStatement 赋值表达式
所以不行

# require 和 import

require 是动态导入 编译时无法确定变量的值 因为 cjs 的本质其实是导出了一个值的引用 后续模块内部值变化
import 是静态导入 编译时就可以分析出来导入的变量的值 import 导出了值的拷贝
