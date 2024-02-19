// const express = require("express");
const express = require("../express手写实现/index");

// 执行express.Router方法会返回一个中间件函数 这个函数是一个引用值
// 它的原型链上既可以像Router的实例一样调用get post等方法注册路由
// 又可以单独被当做一个中间件执行 执行的时候就去依次匹配自己注册的路由
const userRouter = express.Router();

userRouter.get('/add',(req,res)=>{
    res.end('用户新增')
    console.log('cnm函数确实执行了啊');
})

userRouter.get('/remove',(req,res)=>{
    res.end('用户删除')
})

// 新增三级路由
const detailRouter = express.Router();

// 三级路由注册一个路径
detailRouter.get('/id',(req,res)=>{
    res.end('用户id')
})
// 二级路由关联多级路由 每次use的path参只放举例自己最近的
userRouter.use('/add',detailRouter)

module.exports = userRouter;