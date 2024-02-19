/****
 * Koa处理静态资源请求
 * 1. 中间件可以决定是否向下继续执行 
 *      如果自己可以处理就直接处理完毕 
 *      如果处理不了 那么next方法会继续向下执行
 * 
 * 
 * 2. 手写koa-static
 * 
 * 
 * 
 */
const fs = require('fs')
const path = require('path')
const Koa = require('koa');
const bodyParser = require('./中间件手写/koa-bodyparser')
const koaStatic = require('./中间件手写/koa-static');

const app = new Koa();

// bodyParser中间件 解析请求体 并将解析后的结果放在ctx.request.body上
app.use(bodyParser());



// koaStatic中间件 当客户端访问静态资源的时候 直接以当前目录为基础路径查询资源并返回
app.use(koaStatic(__dirname));



// koaStatic中间件 当客户端访问静态资源的时候 直接以public目录为基础路径查询资源并返回 
// 如果没有请求路径 也就是 http://localhost:3000 那么处理为默认返回public下de index.html文件
app.use(koaStatic(path.resolve(__dirname,'public')));



/****
 * 监听错误
 */
app.on('error',(err)=>{
    console.log('报错了',err);
})

/****
 * 监听端口号
 */
app.listen(3000);