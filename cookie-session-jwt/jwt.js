/*****
 * 
 * 1. 什么是jwt
 * json web token是目前最流行的前后端跨域身份校验解决方案
 * cookie不安全 客户端可以任意修改 所以我们放在服务端的session并且基于加盐算法实现cookie信息的安全
 * 但是session必须存储在数据库中，当多个网站需要共享用户身份信息的时候，就需要将session存储在持久层来保持服务
 * 一旦持久层出现问题 session就会失效
 * 
 * 所以就出现了jwt 可以认为是服务端无状态的一种方案 服务端不保存任何回话数据
 * 每次请求到来 服务端只需要从header或者客户端请求中拿到token进行解密
 * 如果解密成功 那么说明身份校验通过
 * 
 * 2. 第三方包 发令牌 解析令牌
 * jsonwebtoken
 * jwt-simple
 * 
 * 
 */

const Koa = require('koa');
const Router = require('@koa/router')
const uuid = require('uuid');
const crypto = require("crypto");
const bodyParser = require('koa-bodyparser')
const jwt = require('jwt-simple');

const router = new Router();
const app = new Koa();

const secret = 'nodejs';

app.use(bodyParser());


router.post('/login',async (ctx,next)=>{
    let {username,password} = ctx.request.body;
    if(username === 'admin' && password == '123456'){
        // 生成jwt token
        const token = jwt.encode({username,password},secret);
        ctx.body = {
            code:200,
            username,
            token
        }
    }
})


router.get('/validate',async (ctx,next)=>{
    let token = ctx.headers['authorization']
    try {
        // 对token解码
        let userInfo = jwt.decode(token,secret);
        ctx.body = {
            code:200,
            userInfo
        }
    } catch (error) {
        ctx.body = {
            code:0,
            msg:'身份校验失败'
        }
    }

})



// 路由中间件
app.use(router.routes());



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