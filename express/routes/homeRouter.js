// const express = require("express");
const express = require("../express手写实现/index.js");
const homeRouter = express.Router();

homeRouter.get('/add',(req,res)=>{
    res.send('主页新增')
})

homeRouter.get('/remove',(req,res)=>{
    res.send('主页删除')
})





module.exports = homeRouter;