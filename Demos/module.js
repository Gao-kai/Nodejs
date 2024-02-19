/**
 * node中的模块化规范：commonjs es module
 * 
 * require是同步导入的
 * 
 * 模块分类：
 *  + 内置核心模块：node中自己提供的 可以直接使用
 *  + 第三方模块：npm安装的模块 不需要有路径直接导入即可 node会自动去node-moduels中查找
 *  + 自定义模块：自己写的模块 导入时需要加上相对路径和绝对路径
 * 
 *  核心模块：
 *  1. fs模块 文件操作 所有方法基本上都有同步方法和异步方法两个版本
 *      如果刚刚运行程序 希望快速拿到结果 就用同步的
 *      如果需要开启一个服务去监听客户端请求 就可能出现并发读取的情况 这时候为了避免阻塞就用异步的
 *      注意：操作文件时尽量使用绝对路径来操作 这时候就要用到path.resolve来拼接绝对路径
 *      但是如何确定目标文件的工作目录呢？这里就要用到__dirname
 *      
 * 
 *  2. path模块
 *  3. vm 虚拟机模块 提供一个沙箱环境
 * 
 */


/**
 * process.cwd():node进程的工作目录(文件夹地址) 比如启动npm run dev 此时node进程在根目录 所以基于process.cwd()可以获取到webpack.config.js
 *              保证了文件在不同的目录下执行时，路径始终不变 因为node的进程目录是不会变的
 * 
 * __dirname 模块内部才有的变量 表示当前模块的目录 其实就是执行的js 文件的地址
 *            等同于在模块内部访问path.dirname()
 * 
 * 
 */
console.log(process.cwd(),__dirname);



/**
 * 
 * path.resolve() 不能包含/ 如果包含会基于C盘目录来进行解析
 * path.join() 就是单纯的字符串拼接
 * path.extname() 获取文件的拓展名
 * 
 * fs.existsSync() 检查文件是否存在
 * 
 */
const fs = require('fs');
const path = require('path');
const isExist = fs.existsSync(path.resolve(__dirname,'../a.txt'))
console.log('isExist',isExist)
if(isExist){
    const res = fs.readFileSync(path.resolve(__dirname,'../a.txt'),'utf-8');
    console.log('res',res);
}


/******
 * 
 * 模板引擎实现原理：with + new Function + 字符串拼接
 * new Function可以把字符串当做js执行 并且提供干净的沙箱环境
 * eval也可以执行字符串 但是不提供沙箱环境 
 * 
 * 变量替换 正则
 * 空间下取值 with
 * 字符串执行 new Function
 * 
 * 除此之外 node中还有一个vm模块 vm模块可以创建一个干净的沙箱环境 类型with
 * 它不会去外部取值 只会在内部取值
 */
const vm = require('vm');
vm.runInThisContext('console.log(a)')