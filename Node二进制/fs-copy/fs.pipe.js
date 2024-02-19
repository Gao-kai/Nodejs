const fs = require('fs');
const path = require("path");

const sourcePath = path.resolve(__dirname,'./密码链接说明.txt');
const targetPath = path.resolve(__dirname,'./target.md');


/****
 * pipe方法：管道
 * 1. pipe内部是异步的
 * 2. pipe函数可以实现读取一点写入一点的操作，将读写连贯起来
 * 
 * 
 */
fs.createReadStream(sourcePath).pipe(fs.createWriteStream(targetPath));

/****
 * 下面是pipe的实现
 * pipe是可读流实例方法，接收参数为可写流实例
 * 可实现读取一点写入一点的效果
 * 
 */
readStream.on('data',(data)=>{
    // 读取后直接写入
    let flag = writeStream.write(data)
  
    if(!flag){
        // 暂停读取流
        readStream.pause();
    }
})

writeStream.on('drain',(data)=>{
    // 缓存写入完毕 恢复读取流
    readStream.resume();
})