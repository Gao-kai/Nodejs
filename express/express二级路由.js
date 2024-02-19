// const express = require("express");
const express = require("./express手写实现/index");

const app = express();

// const homeRouter = require('./routes/homeRouter')
const userRouter = require('./routes/userRouter')

// 注册二级路由
app.use('/user',userRouter)
// app.use('/home',homeRouter)

app.listen(3000);