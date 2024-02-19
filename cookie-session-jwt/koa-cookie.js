const Koa = require('koa');
const Router = require('@koa/router')
const uuid = require('uuid');
const router = new Router();
const app = new Koa();
const session = require('koa-session');

/**
 * koa框架集成了cookie的读写方法
 * 设置cookie的时候如果配置了加密app.keys = ['nodejs'];
 * 那么会返回给客户端两个cookie
 * 第一个是正常的key-value
 * 第二个是加密的key变成了key.sig value变成了加密后的值 
 * koa在加密的时候会将key=value一起进行加密，采用sha1加密算法
 * 
 * express则是直接返回一个加密的cookie
 * key不变 value变为value.加密内容
 * 采用sha256加密算法
 * 
 * 
 * -- session
 * 1. session是基于cookie的
 * 2. cookie过期 session也过期
 * 3. koa-session是一个关于koa中session的包
 * 4. session的问题在于每次重启服务无法维持用户状态
 */

// 设置加密密钥
app.keys = ['nodejs'];

// 设置session
// const session = {};

// 设置店铺名字 怕找错服务器
const cardName = 'nodejs.sid' 


router.get('/buy',async (ctx,next)=>{
    // 先从cookie中基于cardName取出uid 拿到session中匹配 
    let uid = ctx.cookies.get(cardName)
    // 如果找到了说明之前请求过
    if(uid && session[uid]){
        // 第二次再进来 此时不要重复下发cookie了 而是直接在服务端把用户信息刷新即可
        session[uid].money -=100;
        ctx.body = `您当前卡上余额为${session[uid].money}元！`
    }else{
        // 首次登录 先生成一个唯一uid
        let uid = uuid.v4();

        // 将用户id和用户信息存入session
        session[uid] = {name:'lilei',age:18,money:1000}

        // 设置响应cookie 
        ctx.cookies.set(cardName,uid,{httpOnly:true})

        ctx.body = `您当前卡上余额为${session[uid].money}元！`
    }
})

// 路由中间件
app.use(router.routes());

// session中间件
app.use(session({},app));

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