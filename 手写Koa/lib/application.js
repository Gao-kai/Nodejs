const EventEmitter = require("events");
const http = require("http");
const Stream = require("stream");

let context = require("./context");
let request = require("./request");
let response = require("./response");

class Application extends EventEmitter {
  constructor() {
    super();

    /**
     * 第一次对象的拷贝
     *
     * 每一次new Koa的时候都创建一个全新的对象
     * 防止多个new出来的实例对象共享context  request reponse
     * 避免对原有的对象进行污染 如：
     *
     * this.context = context
     * new Koa().context.a = 100;
     * context.a => 100 导入的context对象被污染了
     */
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);

    this.middleWares = [];
  }

  /**
   * 每次请求都会创建一个全新的ctx对象
   * 也就是每次handleRequest方法触发的时候内部的ctx对象都是独立的
   * 不能是第一个请求来了创建一个ctx对象添加了一个属性
   * 下一次请求进来可以复用这个ctx对象 这会造成程序的紊乱和不可追踪
   */
  createContext(req, res) {
    let context = Object.create(this.context);
    let request = Object.create(this.request);
    let response = Object.create(this.response);

    // request reponse是自己封装的对象
    context.request = request;
    context.response = response;

    // req 是node原生自带的对象 并且 context.request也有req对象指向req
    context.req = context.request.req = req;
    // res 是node原生自带的对象 并且 context.reponse也有res对象指向res
    context.res = context.response.res = res;

    return context;
  }

  /**
   * 中间件组合函数 将多个use的回调组合为一串可以依次暂停或按顺序执行的函数
   *
   * 返回值一定是一个Promise成功态
   *
   * 核心是dispatch方法的返回值是一个Promise
   * 并且next函数是一个箭头函数 执行next函数有两个功能：
   * 1. 取出下一个中间件执行
   * 2. 返回的也是一个Promise 所以下一个中间件中的await代码可以等待执行完成
   */
  compose(ctx) {
    // 在数组中先执行第一个 第一个执行完成之后执行第二个
    // 经典的异步迭代思路
    const dispatch = (i) => {
      // 当i索引和队列中的中间件数量相等 返回
      if (i === this.middleWares.length) {
        return Promise.resolve();
      }

      // 取出一个中间件
      let middleWare = this.middleWares[i];

      // 依次执行 执行的时候next是一个函数 它等于箭头函数()=>dispatch(i+1)
      // 当next被调用的时候 就会触发dispatch 接着会取出第二个中间件
      // 必须保证dispatch函数返回一个promise函数 所以需要包装下
      return Promise.resolve(middleWare(ctx, () => dispatch(i + 1)));
    };

    return dispatch(0);
  }

  handleRequest(req, res) {
    let ctx = this.createContext(req, res);
    // 组合中间件 本质就是将多个promise组合为一个大的promise
    this.compose(ctx).then(() => {
      // 当组合后的大的promise完成之后 拿到最终结果 响应回去
      let body = ctx.body;

      //   类型判断 响应结果设置
      if (typeof body === "string" || Buffer.isBuffer(body)) {
        res.end(body);
        // 如果是流  那么通过管道传输给可写流res
      } else if (body instanceof Stream) {
        /****
         * Content-disposition是MIME协议的扩展，MIME协议指示MIME用户代理如何显示附加的文件。
         * 当Internet Explorer接收到头时，他会激活文件下载对话框，它的文件名框自动填充headers指定的文件名。
         * 服务器主动提示浏览器下载的请求头
         */
        res.setHeader('Content-Disposition','attachment;filename=down.js')
        body.pipe(res);
        // 如果是对象 那么转义
      } else if (typeof body === "object") {
        res.end(JSON.stringify(body));
      }
    });
  }

  use(callback) {
    this.middleWares.push(callback);
  }

  listen(port) {
    let server = http.createServer(this.handleRequest.bind(this));
    server.listen(port);
  }
}

module.exports = Application;
