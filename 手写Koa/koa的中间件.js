// const Koa = require("koa");
const Koa = require("./lib/application");
const app = new Koa();
const fs = require('fs')


function logger() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("等待3秒");
        resolve();
      }, 3000);
    });
  }


/****
 * 
 * 直接执行：1 3 5 6 4 2 典型的洋葱圈模型
 * 
 * koa的中间件原理：
 * 1. 会将所有的中间件组合成为一个大的promise
 * 2. 当这个promsie执行完毕之后会采用当前的ctx.body当做结果进行结果的响应
 * 3. 每个next方法前都需要加await 或者return 否则没有等待效果
 * 4. 如果都是同步执行 加不加next没有什么关系 但是因为后续不知道时候有异步逻辑
 * 5. 所以写的时候都加await比较保险
 * 6. async函数中return一个值 等于等待这个Promise包裹的值执行完毕然后返回promise
 * 7. 响应给客户端的永远是最外层那个洋葱圈的结果
 * 
 * next方法的好处：
 * 1. 可以将请求处理等多个模块通过next方法链接起来
 * 2. 可以决定时候向下继续执行 这个可以用来控制后台权限 无权限不向下走
 * 3. 可以封装一些方法或者添加一些属性在中间件ctx中 后续可以直接执行
 * 
 */
app.use(async (ctx, next) => {
    console.time('1');
  console.log(1);
   await next();
  console.log(2);
  console.timeEnd('1');
});


app.use(async (ctx, next) => {
  console.log(3);
  // await logger();
  await next();
  console.log(4);
});


app.use(async (ctx, next) => {
  console.log(5);
  await next();

  /**
   * ctx.body的值可以是对象 字符串 或者buffer
   * 也可以是可读流
   */
  // ctx.body = {name:100}
  ctx.body = fs.createReadStream('./async函数执行流程.js');

  console.log(6);
});


app.listen(3000);


