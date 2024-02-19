## 高阶函数相关

+ 实现发布订阅模式的4个基本方法 
+ 实现观察者模式 Vue
+ 知道观察者模式和发布订阅模式的区别 并举例说明

+ 实现 防抖和节流
+ 实现 函数柯里化和反柯里化
+ 实现防抖和节流在一个函数实现 lodash有实现

## Promise相关的

+ 手写Promise源码 背下来或者手写
+ Promise.all
+ Promise.race
+ Promise.prototype.finally
+ Promise.allSettled
+ Promisify实现
+ then链的特点 为什么then是异步的
+ 手写co库的实现原理 异步迭代next的思想 还有koa和删除文件夹都是异步迭代
+ co+generator如何实现async await

## Promise的高阶使用

+ 实现一个最大并发数有限制的批量请求函数 multiRequest(urls,maxNum)
+ 使用Promise.all实现5个请求，若其中一个失败，如何让其他4个成功的可以返回


## 异步解决方案的发展历史以及优缺点

+ 回调函数
+ promise的优缺点
+ generator
+ async await


## 浏览器事件循环及代码输出题

+ 浏览器的EventLoop事件循环 图示
+ Nodejs的事件循环机制 Node官方图示 是如何划分队列的
+ 宏任务（宿主环境提供的方法）和微任务（语言实现的 Promise等）
+ 代码输出题
+ 区别：实现方式不同 但是执行顺序一致
+ process.nextTick 实现原理


## Node核心
+ Nodejs的特点、优点和缺点

> 单线程:不用频繁的去开关线程 线程切换 锁的问题 
> 非阻塞异步i/O

适合处理I/O密集型操作 如文件读写 而web服务多数就是操作服务器上的资源进行读写 适合当BFF层
不适合处理CPU密集型的 如加密解密 因为它是单线程 

+ Nodejs是单线程还是多线程

Nodejs的主线程是单线程的 但是其他操作比如读取文件 加密等都会开启其他子进程去处理 子进程会开自己的线程

+ 为什么js是单线程的 

如果js是多线程的那么会互相影响 
由于Nodejs主线程是单线程的这一特点 所以node不适合处理运算量大的操作 因为会阻塞后续执行


+ 场景
Node一般做前后端分离的BFF层 服务于前端的后端


## Node的模块

+ 模板引擎的实现原理 ejs库的实现
正则匹配
with实现作用域
new Function

+ 模块化发展历史
闭包
命名空间
amd
cmd
cjs
esm
umd


+ node中require模块时的解析规则
相对路径
第三方
js
json
文件夹
index

+ 手写commonjs的实现原理

+ webpack rollup vite区别

webpack 多用于项目开发 可以将任意类型的文件打包成静态资源
rollup 多用于打包类库 很干净 tree shaking 打包不了图片等资源 只能打包js
vite 实现了原生esm打包

+ export 和 export default的区别

export 只能导出接口
export default 导出的是js的值


## EventEmitter 发布订阅模式的使用
+ on
+ off
+ emit
+ once

## NPM常见命令及用法
+ 下载
+ 安装
+ 版本号管理
+ 发布


## Buffer
+ 说一下Buffer数据类型的认识？是什么？有什么用？为什么要有Buffer
+ 对于初始化的Buffer 可以实现增加长度吗
+ Buffer.from
+ Buffer.alloc
+ Buffer.isBuffer
+ Buffer.concat

## 二进制
+ 手写二进制转Base64

## fs模块
+ 掌握常见的fs模块的api
+ 掌握常见的数据结构链表和二叉树

## 深拷贝
+ 实现一个对象的深拷贝

## 流
+ 多个异步嵌套的情况 如何解耦？ 发布订阅实现的 如何实现

+ 多个异步并罚如何处理？ 基于队列处理 为什么要这样？ 读一点写一点

+ 可读流
+ on('data')
+ on('data')

+ 可写流
+ on('end')
+ write

+ 流的转换
+ pipe方法

+ Nodejs中存在哪些流 怎么理解pipe及其优点
- 可读流 req
- 可写流 res
- 转换流 zlib.createGzip()
- 双工流 socket

## http
+ 请求方法
+ header
+ 状态码
+ 跨域解决方案
+ 表单时候可以跨域
+ 304强制缓存和协商缓存
+ gzip压缩实现
+ 301 302对于seo的优化

## Koa
+ 核心就是上下文的实现
+ 核心就是中间件的实现
+ 手写一个Koa库并理解其洋葱圈模型
+ 使用reduce实现compose函数
