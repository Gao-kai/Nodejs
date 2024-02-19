const http = require('http');
const Router = require('./router/index')
const methods = require('methods');

/**
 * 每次外部new Applictaion创建一个新的应用的时候
 * 路由系统应该是独立和 互相没有任何关系的
 * 所以routes应该当做实例属性传入 这样子每一个应用上的routes属性都是独立的
 * 而不是指向一个公共的routes对象
 */
function Applictaion(){
    /**
     * express的路由系统由两部分构成：
     * 1. 默认内置的路由 当用户配置的所有路径都匹配不到的时候命中此路由 返回cannot
     * 2. 用户自定义的路由 会按照配置顺序从上到下依次匹配
     * 
     */
    /* this.routes = [
        {
            path:'*',
            method:'all',
            handler(req,res){
                return res.end(`Cannot My Express ${req.method} ${req.url}`)
            }
        }
    ] */

    /* 
        一开始new Applictaion时先不创建 有性能问题
        真正的用到了才调用lazyRoute去创建
        this._router = new Router(); 
    */
}

/**
 * 路由系统懒加载
 * 每次调用此方法会判断_router是否存在
 * 如果没有 说明之前没用到 现在用到了才去创建
 * 如果有 说明已经创建过了 就不重复创建了
 */
Applictaion.prototype.lazyRoute = function(){
    if(!this._router){
        this._router = new Router();
    }
} 

/**
 * 外部调用app.use注册中间件
 * 传递的参数是path和handler
 * 但是path可能不传递
 * 应用层不处理 交给路由层Router处理
 * @param  {...any} args 
 */
Applictaion.prototype.use = function(...args){
    this.lazyRoute();
    this._router.use(...args)
}


/****
 * 批量生成方法
 */
methods.forEach((method)=>{
    
    /**
     * 每次执行get方法等于往路由系统中添加一个路由Record
     * @param {*} path 请求路径
     * @param {*} handler 路径匹配后的回调
     */
    Applictaion.prototype[method] = function(path,...handlers){
        /* this.routes.push({
            path,
            method:'get',
            handler
        }) */
        this.lazyRoute();
        this._router[method](path,handlers)
    }
  })


Applictaion.prototype.listen = function(port,callback){
    const server = http.createServer((req,res)=>{
        /* 
        const {pathname} = url.parse(req.url);
        const requestMethod = req.method.toLowerCase();

        // 循环匹配 匹配到一个理解退出循环 返回结果
        for (let i = 0; i < this.routes.length; i++) {
            const {path,method,handler} = this.routes[i];
            if(path === pathname && method === requestMethod){
                return handler(req,res);
            }
        }

        // 没有匹配到默认返回第一个默认路由
        return this.routes[0].handler(req,res); */

        // 不能匹配走done回调
        function done(){
            res.end(`Cannot My Express ${req.method} ${req.url}`)
        }

        // 到这一步说明客户端有请求 此时需要用到路由系统 才开始懒加载
        this.lazyRoute();

        // 处理客户端请求的方法 
        console.log('当前路由系统this._router',this._router);
        this._router.handle(req,res,done)
        
    });

    server.listen(port,callback)
}


module.exports = Applictaion;