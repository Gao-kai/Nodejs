

const userRouter = require('./userRouter');
const homeRouter = require('./homeRouter');

/**
 * 整合路由 基于第三方包：koa-combine-routers
 * 执行combineRoutes方法会返回一个中间件
 * 也就是async函数
 */
const combineRoutes = require('koa-combine-routers')
module.exports = combineRoutes(userRouter,homeRouter)