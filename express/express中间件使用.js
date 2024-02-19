// const express = require("express");
const express = require("./express手写实现/index");
const app = express();

/****
 * 中间件的特点：
 * 1. 可以决定是否向下执行
 * 2. 可以拓展原生属性的属性和方法
 * 3. 可以校验权限
 * 4. 中间件的访问位置在路由注册之前 这样才可以起到中间件拦截请求处理的效果
 * 5. 中间件只针对路径 不针对请求方法 也不针对参数
 * 6. 中间件的核心就是拦截路径 然后在真实请求处理之前对路径的请求参数做校验
 * 7. 除此之外 中间件还有一个作用就是在请求之后拦截 然后拓展原生req的属性和方法
 */

/****
 * express中间件匹配特殊规则：
 * 1. 全量匹配
 * 路径为/ 表示所有路径都可以匹配 都会走当前中间件
 *
 * 2. 开头匹配
 * 可以匹配某个路径开头 比如/api的中间件
 * 后续所有以/api开头的路径都会被匹配到 比如：
 * /api/user
 * /api/list
 *
 * 3. 相等匹配
 * 当请求路径和中间件路径完全一致的时候 也是可以匹配的
 *
 * 4. 当路径参数不传递的时候 默认就是为/
 * ...
 */
app.use("/", (req, res, next) => {
  console.log("拦截到请求1" + req.url);
  next();
});

app.use("/", (req, res, next) => {
  console.log("拦截到请求2" + req.url);
  next();
});

app.use("/", (req, res, next) => {
  console.log("拦截到请求3" + req.url);
  next();
});


// app.use('/api',(req,res,next)=>{
//     console.log('拦截到请求' + req.url);
//     next();

//     // if(req.query.name=='1'){
//     //     next()
//     // }else{
//     //     res.send('没有权限 无法访问api接口')
//     // }
// })

// app.use('/user/list',(req,res,next)=>{
//     if(req.query.name=='1'){
//         next()
//     }else{
//         res.send('没有权限 无法访问user/list接口')
//     }
// })

/* 注册路由 */
app.get("/", (req, res, next) => {
  res.end("报错了 来自路由");
});

app.get("/api", (req, res) => {
  res.end("api ok");
});

app.use("/", (err,req, res, next) => {
    console.log("错误处理中间件");
    res.end(err)
});

app.listen(3000, () => {
  console.log("server start on port 3000!!!");
});
