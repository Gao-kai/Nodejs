const Application = require('./applictaion')

/**
 * 
 * 问题1. 创建应用的过程和应用本身需要分离
 * 从return {}改变为new Applictaion返回一个全新的实例
 * 对象不容易拓展 类容易拓展
 * 
 * 问题2. 路由系统和应用系统需要分离
 * 也是基于类实现
 * 
 * 
 */
function createApplication(){
    return new Application();
}

/**
 * 多级路由实现
 * 外界通过执行 express.Router方法可以返回一个路由新的实例
 * 1. 首先外界导入的express就是这里导出的createApplication函数
 *      直接执行可以返回一个app实例
 * 2. 可以执行express.Router方法 那么说明express.Router是一个方法
 *      也就说明createApplication.Router也是一个方法
 *      执行此方法返回一个路由实例
 * 3. 路由和什么有关 和Router类有关 之前是过new Router产生路由实例
 *      现在执行Router方法也要产生 也就是Router是可new可执行的
 * 4. 执行express.Router方法返回值可以当作app.use的第二个参数
 *      那么说明express.Router方法返回值也一定是一个handler函数
 * 
 * 至此：
 * 1. createApplication上有一个属性Router，它的值是一个函数，因为它可以执行
 * 2. createApplication.Router方法的返回值也一定是一个函数
 * 3.
 */
const Router = require('./router/index')
createApplication.Router = Router;



module.exports = createApplication;