const url = require("url");
const Layer = require("./layer");
const Route = require("./route");
const methods = require("methods");

// 创建一个空对象 在它上面挂载方法和属性 然后让router.__proto__指向这个对象
// 既可以满足new Router后返回的实例router可以调用get post use等方法
// 又可以满足直接执行Router方法返回的是一个函数router
const proto = {};

function Router() {
  // 二级路由的实现
  let router = (req, res, next) => {
    // 当请求到来 去自己的路由系统进行匹配操作 当这里的next被调用的时候
    // 就等于内部的栈找完了 现在接着去外层的layer中匹配
    console.log('----router.handle开始执行-----');
    router.handle(req, res, next);
    console.log('----router.handle执行完毕------');
  };
  /****
   * Router实例的stack栈中存放的是一个个的外层Layer实例
   * 每一个Layer实例中存放两个东西：
   * 1. 外界调用app.get方法时传入的path
   * 2. 当前产生的Layer实例一定会关联一个Route实例，那么第二个东西就是这个Route实例的dispatch方法
   *    这个dispatch方法最主要作用就是
   *
   */
  router.stack = [];

  // es5继承
  // router.__proto__ = proto;

  // es6继承
  Object.setPrototypeOf(router, proto);

  // 返回的这个对象router会当作this
  return router;
}

/**
 * 处理中间件
 * 用户可能按照要求传递path和handlers，比如：
 * app.use('/api',(req,res,next)=>{},(req,res,next)=>{})
 *
 * 用户也可能不按照要求传递，只传递handlers，此时需要特殊处理path默认值为/:
 * app.use((req,res,next)=>{},(req,res,next)=>{})
 */
proto.use = function (pathOrHandler, ...handlers) {
  let path;
  // 如果用户没传递path 那么默认就是/
  if (typeof pathOrHandler === "function") {
    path = "/";
    handlers.push(pathOrHandler);
  } else {
    // 如果用户传递了path 那么就按照用户传递的来
    path = pathOrHandler;
  }

  // 拿到本次调用use传递的handlers 依次包装了Layer实例的形式
  // 存放到Router的stack中 请求到来之后 便从上到下先执行中间件
  // 然后处理路由匹配
  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i];
    const layer = new Layer(path, handler);
    // 给中间件的layer打上一个标记 区分中间件和路由
    layer.route = undefined;

    this.stack.push(layer);
  }
};

/**
 * 用户调用get方法之后：
 * 1. 生成一个Route实例
 * 这个Route实例产生的过程中还会生成一个Layer实例用来匹配path
 * 并且这两个会产生关联
 * 并且Layer实例会被放入到Router实例的stack外层栈中
 *
 * 2. 调用Route实例的get方法
 *
 * 将用户传入的handlers保存在Route实例内部的stack内层栈中
 * 这个内层的栈专门用来保存用户传入的handlers
 * 并且还会标记这个handler是什么方法 以免
 *
 *
 *
 * @param {*} path
 * @param {*} handlers 用户可能传递一到多个handler方法
 */

methods.forEach((method) => {


  proto[method] = function (path, handlers) {
    /* this.stack.push({
          path,
          method:'get',
          handler
      }) */
    let route = this.route(path);
    route[method](handlers);
    console.log('route实例',route);
  };
});

/**
 * Router实例的route方法作用：
 * 1. 生成一个Route实例
 * 2. 生成一个Layer实例
 * 3. 让这个Layer实例和Route实例产生关系
 * 4. 把生成的layer实例放入router实例的stack栈中 也就是外层的栈
 * 5. 返回这个生成的Route实例
 * @param {*} path
 * @param {*} handler
 */
proto.route = function (path) {

  // 1. 生成一个Route实例
  const route = new Route();

  // 2. 生成一个Layer实例 并通过参数的方式route.dispatch.bind(route)产生了一次弱关联
  const layer = new Layer(path, route.dispatch.bind(route));

  // 3. 再次让layer实例和route实例产生强关联 后续layer实例可以通过route属性找到对应的route实例
  // 然后进一步找到route关联的handlers 依次执行
  layer.route = route;

  // 4. 把生成的layer实例放入router实例的stack栈中 也就是外层的栈
  this.stack.push(layer);

  // 5. 返回这个生成的Route实例
  return route;
};

/**
 *
 * 每一次客户端请求到来之后 都需要调用路由系统的handle方法处理请求
 * 1. 依次取出路由系统中也就是stack中保存的每一个layer实例
 * 2. 依次匹配路径 匹配到就执行layer上的dispatch方法
 * 3. 此方法会通知和它关联的route依次取出内部保存的hanler执行
 * 4. 匹配不到 就next匹配下一个layer
 * 5. 所有都没有匹配到 就终止异步迭代 执行out方法 就是那个路径匹配不到报错的cannot方法
 * @param {*} req
 * @param {*} res
 * @param {*} done 所有路径都匹配不到的时候 从匹配外层Layer的异步迭代中跳出的方法
 * @returns
 */
proto.handle = function (req, res, out) {
try {
    /* const { pathname } = url.parse(req.url);
  const requestMethod = req.method.toLowerCase();

  // 循环匹配 匹配到一个理解退出循环 返回结果
  for (let i = 0; i < this.stack.length; i++) {
    const { path, method, handler } = this.stack[i];
    if (path === pathname && method === requestMethod) {
      return handler(req, res);
    }
  }

  // 没有匹配到执行done回调 done回调会返回一个cannot
  done(); */

  let { pathname } = url.parse(req.url);
  let index = 0;
  let removedPath = "";
  console.log('执行proto.handle而不是next',req.url,pathname,removedPath);
  /**
   * 这个err包含了内层的报错信息被out出来的
   * 以及自己外层在异步迭代的过程中出错自己传递的
   * 所以就可以做统一的错误处理
   * @param {*} err
   */
  const next = (err)=> {
    if (index >= this.stack.length) {
      return out();
    }
    const layer = this.stack[index++];

    // 从中间件出来 再添加进去 
    if (removedPath) {
      req.url = removedPath + pathname;
      removedPath = "";
    }

    console.log( 'before removedPath=',removedPath,'；req.url=',req.url,'pathname',pathname);

    // 如果报错
    if (err) {
      console.log("--- 统一错误处理", err);
      // 处理中间件错误 普通中间件接着执行 4个参数的错误中间件就return
      if (!layer.route) {
        layer.handleError(err, req, res, next);
      } else {
        // 如果是路由报错则跳过 就携带错误继续向下执行
        console.log("--- 路由报错", err);
        next(err);
      }
    } else {
      // 第一次判断：如果没有报错 首先匹配path路径是否ok
      if (layer.match(pathname)) {
        // 第二次判断：判断是中间件还是说是路由

        if (!layer.route) {
          // 是中间件还不行 还不能是错误处理中间件 只能执行普通中间件
          if (layer.handler.length !== 4) {
            // 为了匹配二级路由 需要截取需要的部分
            if (layer.path !== "/") {
              // layer.path就是中间件的路径 /user
              removedPath = layer.path; 
              // 修改req.url
              req.url = pathname.slice(removedPath.length);
            }

            // 说明是普通中间件 直接执行即可 无需再去匹配方法
            layer.handleRequest(req, res, next);
          } else {
            // 说明是错误处理中间件 让错误向下next走
            next();
          }
        } else {
          // 第三次判断：如果是路由 那么请求方法是否在map中注册过
          // 首先匹配方法在内层layer中是否注册过 只有注册过才有可能找到 才去匹配

          if (layer.route.methodsMap[req.method.toLowerCase()]) {
            /****
             * 匹配到了 注意这里要将遍历外层layer的next方法执行权给handler
             * 作用就是内层的每一个handler执行完成之后出来继续回到外层layers
             * 接着执行下一个外层layer
             */
            layer.handleRequest(req, res, next);
          } else {
            // 没注册过 那就不匹配 直接向下走 没有找的意义
            next();
          }
        }
      } else {
        // 没有匹配到 接着匹配下一个
        next();
      }
    }
  }

  next();
} catch (error) {
  console.log('************error',error);
}
};

module.exports = Router;
