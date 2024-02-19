/****
 * 
 * node中实现代码调试
 * 
 * 1. 浏览器中调试 某些模块可以使用这种方式
 * node --inspect-brk .\debugger.js 默认在代码执行的第一行打上断点
 * chrome://inspect/#devices
 * Open dedicated DevTools for Node
 * 
 * 2. vscode中自带调试 最方便的
 * 新建launch.json文件 进行调试
 *
 * 
 */



/******
 * 
 * 调试node源码 挖掘require的实现原理
 * 
 */
const obj = require('./a.js');


