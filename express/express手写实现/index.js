/****
 * 手写实现Express库！
 * 
 * 一. 目录结构
 * ├── index.js 入口文件
   └── lib
        ├── applictaion.js 创建http服务
        ├── middleware.js 内置实现的中间件
        ├── request.js   拓展req原生对象
        ├── response.js   拓展res原生对象
        ├── router.js     路由系统
        ├── utils.js 工具方法
        └── view.js 模板引擎
 *
 *
 * tips: Node打印目录树的第三方包
 * npm install -g tree-node-cli
 * 
 * 
 * 二、核心Layer思想
 * 外层Layer匹配路径
 * 内层Layer匹配方法名称
 * 异步迭代
 * 跳出异步迭代控制权
 * 
 * 三、性能问题
 * 1. 默认在创建应用的时候就会new Router生成一个路由系统，可是用户不一定要用到路由
 * 如何解决？采用路由懒加载
*/

module.exports = require('./lib/express');