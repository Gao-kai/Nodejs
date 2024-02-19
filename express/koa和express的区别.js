/****
 *
 * Koa和Express的相同点：
 * 两者都是同一团队开发的适用于开发web应用的Nodejs框架
 *
 * Koa和Express的区别：
 * 1. Koa内部是通过es6语法来编写的，内部有大量的promise和async以及await语法；express是通过es5语法来编写的，内部是基于回调函数实现
 *
 * 2. express内部自身就实现了很多中间件，功能相对来说比koa更加想打，比如内部集成了路由、静态服务、模板引擎；而koa主要关注核心use的使用，也就是中间件
 *
 * 3. express基于回调和koa基于promise实现不同，所以对于中间件的写法不同，错误捕获也不同
 *
 * 4. koa内部的ctx对象不仅有原生的req和res，还拓展了requres和response对象；express内部直接对原生req和res进行了拓展
 *
 * 5. webpack-dev-server采用了express来创建web服务，所以express的功能要比koa强大一些，koa的中间件还需安装第三方包来实现
 *
 *
 */
