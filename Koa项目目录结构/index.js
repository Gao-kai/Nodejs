const Koa = require('koa');
const router = require('./routes/index.js')
const views = require('koa-views');
const app = new Koa();

/**
 * 加载views中间件 
 * 
 * 1. 会在ctx上添加一个render方法, ctx.render方法用法和ejs一样 但是返回的时promise
 * 2. 此方法可以渲染模板引擎
 * 3. 返回值是一个async函数
 */

app.use(views(__dirname + '/views',{
    map:{
        html:"ejs" // 所有views下的html文件都用ejs进行渲染
    }
}));

// // 加载路由中间件
// app.use(router.routes())

// // 加载请求方法不匹配的中间件 比如get请求发的post 那么会报错 405
// app.use(router.allowedMethods());

// 加载路由
app.use(router())

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