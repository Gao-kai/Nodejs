
const path = require('path')
const Koa = require('koa');
const bodyParser = require('../中间件手写/koa-bodyparser')
const koaStatic = require('koa-static');



const app = new Koa();

// bodyParser中间件 解析请求体 并将解析后的结果放在ctx.request.body上
app.use(bodyParser(path.resolve('../','upload')));



// koaStatic中间件 当客户端访问静态资源的时候 直接以当前目录为基础路径查询资源并返回
app.use(koaStatic(__dirname));



// koaStatic中间件 当客户端访问静态资源的时候 直接以public目录为基础路径查询资源并返回 
// 如果没有请求路径 也就是 http://localhost:3000 那么处理为默认返回public下de index.html文件
app.use(koaStatic(path.resolve('../','public')));

// 请求处理
app.use(async (ctx,next)=>{
    if(ctx.method === 'POST' && ctx.path === '/upload'){
        ctx.body = ctx.request.body
    }
})


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