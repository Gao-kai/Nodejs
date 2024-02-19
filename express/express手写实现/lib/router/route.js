const Layer = require("./layer");
const methods = require("methods");

/* app.get('add1',fn1,fn2)
app.get('add1',fn3)
// Router
{
    stack:[
        // Layer1
        {
            path:'add1',
            handler:route.dispatch.bind(route),
            route: {
                // Route1
                stack:[
                    // Layer-1
                    {
                        path:'',
                        handler:fn1,
                        method:'get'
                    },
                    // Layer-2
                    {
                        path:'',
                        handler:fn2,
                        method:'get'
                    },
                ]
            }
        },
        // Layer2
        {
            path:'add1',
            handler:route.dispatch.bind(route),
            route:{
                // Route2
                stack:[
                    // Layer-1
                    {
                        path:'',
                        handler:fn3,
                        method:'get'
                    }
                ]
            } 
        }
    ]
} */

function Route() {
  /****
   * Route实例的stack栈中存放的是一个个的内层Layer实例
   * 1. 这个内层Layer实例的path属性不重要
   * 2. 每一个Layer实例会存放标记了请求方法的handler
   *    因为用户传入的handlers中可能不仅仅是get方法
   *    还可以有其他方法对应的handler
   *
   */
  this.stack = [];
  this.methodsMap = {};
}

/****
 * 批量生成方法
 */
methods.forEach((method) => {
  /**
   * 调用route的get方法的时候
   * 1. 先循环用户传入的handlers
   * 2. 为每一个handler生成一个关联的Layer实例
   * 3. 给每一个Layer实例打上method标记
   * 4. 将这个Layer实例加入到Route实例的stack中
   */
  Route.prototype[method] = function (handlers) {
    // 不是数组 变成数组
    if(!Array.isArray(handlers)){
      handlers = [].concat(handlers)
    }

    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
     
      // 内层的layer的path没有意义 只有handler有意义
      const layer = new Layer("", handler);
      layer.method = method;
      
      // 优化手段：外界每次注册一个方法 就映射一次
      // 避免出现用户同一path注册了get post put方法 但是发送delete请求时
      // 虽然路径匹配到了 但是此时没必要再去循环遍历了 因为delete对应的handler压根不存在
      this.methodsMap[method] = true;

      
      this.stack.push(layer);

    }
  };
});

/**
 * 调用route的dispatch方法的时候
 * 会将当前实例的stack栈中的handler拿出来依次执行
 *
 */

/**
 * 调用route的dispatch方法的时候
 * 会将当前实例的stack栈中的handler拿出来依次执行
 * @param {*} req
 * @param {*} res
 * @param {*} out 这里的out是Router.handle方法中将跳出外层layer异步迭代的控制权交给了Route
 */
Route.prototype.dispatch = function (req, res, out) {
  let index = 0;
  const next = (err) => {
    // 如果执行next的过程中有参数err 说明出错了 就直接out出去 到外层的stack
    if(err){
        out(err);
    }
    if (index >= this.stack.length) {
      return out();
    }
    const layer = this.stack[index++];

    if (layer.method === req.method.toLowerCase()) {
      // 这里的next是函数内部自己定义的
      // 就是外界用户真正调用的next方法
      // 调用一次 取出当前Route实例上保存的一个handle去匹配
      // 然后匹配到之后执行

      layer.handleRequest(req, res, next);
    } else {
      next();
    }
  };

  next();
};

module.exports = Route;
