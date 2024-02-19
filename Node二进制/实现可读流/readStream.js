/*****
 * 
 * 可读流：Node中自己实现的核心模块stream
 * 由于文件操作也需要流一样一边读取一边写入，所以原生的fs模块集成了stream模块
 * 
 * 
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname,'../fs-copy/密码链接说明.txt');

/**
 * 创建一个可读流 本身并不会读取文件
 * 
 * filePath 路径
 * options 配置对象
 *  flags 读取操作
 *  encoding
 *  mode 权限 八进制 可读可写
 *  autoClose 读取完成之后是否自动关闭流
 *  start 开始位置 包含前
 *  end 结束位置 包含后
 *  highWaterMark 每次读取的最大Size 读取时默认为64k
 */
const readStream = fs.createReadStream(filePath,{
    flags:'r',
    encoding:null,
    mode:0o666, 
    autoClose:true,
    start:0,
    end:20,
    highWaterMark:3
})

/****
 * open和close事件仅仅是文件流可以触发 其他流触发不了
 * 
 * data事件 监听文件流读取
 * end 监听文件读取结束
 * error 监听文件读取错误
 * 
 * rs.pause() 暂停流传输
 * rs.resume() 恢复流传输
 */
readStream.on('open',(fd)=>{
    console.log('打开文件开始读取',fd);
})

readStream.on('close',()=>{
    console.log('文件关闭');
})

let bufferList = [];
readStream.on('data',(data)=>{
    readStream.pause();
    setTimeout(()=>{
        readStream.resume();
    },1000)
    console.log('本次读取到的data',data.toString());
    bufferList.push(data);
})


readStream.on('end',()=>{
    console.log('读取完毕',Buffer.concat(bufferList).toString());
})


readStream.on('error',(err)=>{
    console.log('读取文件出错',err);
})

