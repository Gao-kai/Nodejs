/****
 * 
 * 1. 体会Koa这种中间件将功能拆分为一个个小的方法的思想
 * 2. 学会body-parser的核心
 * 
 */
const Koa = require('koa');
const app = new Koa();
const bodyParser = require('./中间件手写/koa-bodyparser')
const fs = require('fs')

/****
 * 
 * 1. bodyParser是函数，执行函数会返回一个新的async函数
 * 
 */
app.use(bodyParser());


/****
 * 核心：每一次请求都会将所有注册的use中的async函数执行一遍
 * 1. 访问根目录返回登录的html
 */
app.use(async (ctx,next)=>{
    if(ctx.method === 'GET' && (ctx.path == '/index.html' || ctx.path == '/')){
      
        ctx.response.header['content-type'] = 'text/html'
        ctx.response.body = fs.readFileSync('./form.html').toString()
    }else{
        await next()
    }
})

/****
 * 2. 客户端post访问/login并携带参数 返回参数
 * 
 * 问题：koa中不能用回调的方式来实现接口处理 因为async函数执行的时候不会等待回调函数执行完成
 * 解决：将所有回调的逻辑都包装到Promise中 然后await这个Promise执行完成 执行完成的标志就是在内部执行resolve或reject方法
 *      必须所有next方法前有await或者return 才有等待效果
 *      return next() 会阻止后续逻辑执行 一般用在最后
 *      await next() 会等待之后继续执行后续逻辑
 */
app.use(async (ctx,next)=>{
    if(ctx.method === 'POST' && (ctx.path == '/login')){

        // 异步逻辑必须得包裹起来 被bodyParser替代
        // await new Promise((resolve,reject)=>{
        //     const bufferList = [];
        //     ctx.req.on('data',(chunk)=>{
        //         bufferList.push(chunk)
        //     })

        //     ctx.req.on('end',()=>{
        //         let res = Buffer.concat(bufferList).toString();
        //         console.log('res',res);
        //         // ctx.body仅仅是赋值 所有promise全部执行完成才会去ctx上取值
        //         // 返回给客户端的是全部promise执行完成之后的那个ctx上的body的值
        //         // 如果还是没有值 那么koa就会响应404
        //         ctx.body = res;
        //         resolve();
                
        //     })
        // })

        ctx.body = ctx.request.body;

    }else{
        await next()
    }
})




// app.use(async (ctx,next)=>{
//     if(ctx.method === 'POST' && (ctx.path == '/reg')){
//         ctx.body = ctx.request.body;
    
//     }else{
//         await next()
//     }
// })




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