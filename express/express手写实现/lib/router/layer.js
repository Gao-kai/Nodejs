function Layer(path, handler) {
  this.path = path;
  this.handler = handler;
}

/**
 * 匹配规则
 * @param {*} pathname 客户端的真实请求路径
 * @returns
 */
Layer.prototype.match = function (pathname) {
  // 如果路径全等 那么ok
  if (this.path === pathname) return true;

  //   匹配中间件
  if (!this.route) {
    // 如果路径是/ 那么ok
    if (this.path === "/") return true;

    /****
     * 否则匹配请求路径是否和中间件注册的头部匹配 如：
     * 中间件path是/api
     *  请求path是/api/user 可以匹配
     *  请求path是/apiv1/user 不可以匹配 所以后面要加个/
     */
    return pathname.startsWith(this.path + "/");
  }
};

Layer.prototype.handleRequest = function (req, res, next) {
  this.handler(req, res, next);
};

Layer.prototype.handleError = function (err, req, res, next) {
    // 如果是错误中间件 就执行执行对应的handler 并将参数依次传入 然后return
    if(this.handler.length === 4) {
        return this.handler(err, req, res, next);
    }

    // 如果不是错误中间件 说明是普通的中间件 继续向下执行
    next(err);
};

module.exports = Layer;
