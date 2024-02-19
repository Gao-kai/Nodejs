// const express = require("express");
const express = require('./express手写实现/index');
const app = express();

/****
 * 这里是路由的中间件演示
 * 访问/路径 会依次执行 1 2 3 4 最后返回ok
 * 将处理的逻辑 拆分成一个个的模块依次执行 而不是一次全部执行
 * 1
 * 2
 * 3
 * 4
 */
app.get(
  "/",
  function (req, res, next) {
    console.log("1，等待一秒！");

    setTimeout(()=>{
      next();
    },1000)
  },
  function (req, res, next) {
    console.log("2");
    next();
  },
  function (req, res, next) {
    console.log("3");
    next();
  }
);

app.get("/", function (req, res, next) {
  console.log("4");
  res.end("ok!");
});

/****
 * 这里是另外一种路由的中间件展示：
 */
// app.route('/user').get(()=>{
//     console.log('user get');
// }).post(()=>{
//     console.log('user post');
// }).delete(()=>{
//     console.log('user delete');
// })


app.listen(3000, () => {
  console.log("server start on port 3000!!!");
});
