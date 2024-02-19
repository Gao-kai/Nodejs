/****
 * 
 * koa是一个Nodejs框架 实现了对于http的一个封装
 * 我们可以根据这个框架去实现自己的mvc框架
 * 
 * koa无法做到约定型
 * 但是egg是一个封装的约定性的nodejs框架
 * 
 * 源码目录
 *  - koa
 *      - lib
 *          + application.js 创建应用
 *          + context.js 上下文
 *          + request.js 请求对象
 *          + response.js 响应对象
 * 
 * 
 */

// const Koa = require('koa');
const Koa = require('./lib/application');
const app = new Koa();

app.use(async (ctx,next)=>{
    console.log(ctx.req.url);
    console.log(ctx.request.req.url);
    console.log(ctx.request.url);
    console.log(ctx.url);



    ctx.body = 'hello world'
    console.log(ctx.response.body);

    // ctx.response.body = '你好啊'
    // console.log(ctx.body);


})

app.on('error',(err)=>{
    console.log('err',err);
})

app.listen(3000);


