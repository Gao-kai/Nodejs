/****
 * 
 * Context(上下文)
 * Context(上下文)也称为ctx对象，是koa框架内部实现的将node中原生的req和res对象以及koa封装的request和response对象封装在一个单独的对象，这个单独的对象就是ctx对象。每一个http请求都会创建一个ctx对象，它上面通过代理模式实现了很多属性和方法的封装。
 * 
 * 
 * 1. API
 * + ctx.req  Node 的 request 对象。
 * + ctx.res  Node 的 response 对象。Koa 不支持 直接调用底层 res 进行响应处理
 *      所以res.statusCode、res.write()、res.end()等都会报错
 * + ctx.request Koa 的 Request 对象。
 * + ctx.response Koa 的 Response 对象。
 * + ctx.state 推荐的命名空间，用于通过中间件传递信息到前端视图
 * + ctx.app 应用实例引用。
 * + ctx.throw([status], [msg], [properties])  抛出包含 .status 属性的错误，默认为 500
 * + ctx.cookies.get(name, [options])
 * + ctx.cookies.set(name, value, [options])
 */

const proto = {
    /****
     * 
     * 这个文件中的proto对象和每次请求创建的唯一的ctx上下文对象关系：
     * 
     * ctx.__proto__ === this.context
     * this.context.__proto__ === proto
     * 
     * 所以：ctx和proto不是同一个引用地址的对象 但是它们通过原型链连接可以访问
     * ctx.xxx => proto.xxx => 此时this就等于ctx对象 
     * 它上面有早已封装好的request对象
     * 而ctx.request对象取值又会去req对象上取值
     * 等于实现了两层代理委托取值
     * 
     */
    // get url(){
    //     console.log(this.__proto__.__proto__ === proto);
    //     return this.request.url
    // },

    // get path(){
    //     return this.request.path
    // },


    // get query(){
    //     return this.request.query
    // }
};


/**
 * 每当ctx.xxx触发访问操作就会基于原型链来访问proto.xxx
 * 由于提前定义好了属性的getter方法 此时就会触发this[target][key]
 * this在属性读取中就是源头最先读取属性的那个对象 也就是ctx对象
 * 代理到ctx的request对象上去取值
 * 
 * @param {*} target 目标访问对象ctx.request 
 * @param {*} key 属性
 */
function defineGetter(target,key){
   /*  Object.defineProperty(proto,key,{
        get(){
            return this[target][key]
        },
        
    }) */
    proto.__defineGetter__(key,function(){
        return this[target][key]
    })
}

function defineSetter(target,key){
   /*  Object.defineProperty(proto,key,{
        set(newValue){
            this[target][key] = newValue
        }
    }) */
    proto.__defineSetter__(key,function(newValue){
        this[target][key] = newValue
    })
}



// 相比在对象内部一个个的通过get属性存取器来定义代理
// 使用方法来同一进行代理要更加直接和易读
defineGetter('request','url');
defineGetter('request','path');
defineGetter('request','query');

defineGetter('response','body');
defineSetter('response','body')

module.exports = proto;