/****
 * 
 * 执行writeStream.write的时候会返回一个布尔值flag告诉本轮写入的字节大小是否会超出预期
 * 这个布尔值会立即返回，true代表ok false代表超出预期
 * 除此之外 可以借助writeStream.on监听drain事件 一旦事件触发说明写入字节已经超出预期
 * 
 * 所以，借助于：flag和drain事件我们可以实现 
 * 只分配给3字节的内存空间 将很大的文件依次写入而不会淹没内存
 * 
 * 基于可写流的写入流程是：
 * 1. 先写入第一次writeStream.write的字节，等待异步写入完成
 * 2. 再次期间同步执行的writeStream.write都会一起执行，然后分配一个内存空间将待写入的内容都用链表连接
 * 3. 等第一个写入ok之后 依次从链表头部取出内容 依次写入
 * 4. 问题就是虽然看起来是连续写入的 但是这中间需要一个很大的内存空间去维护链表
 * 
 */
const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname,'./flag.txt');

const writeStream = fs.createWriteStream(filePath,{
    highWaterMark: 3
})



let index = 0;
function write(){
    let flag = true;
    while(flag && index<10){
        flag = writeStream.write(index+'',()=>{
            console.log('写入成功',index); 
        })
        index++;

        // 关闭文件
        if(index==10){
            writeStream.end('！！！！！！！！！！关闭文件')
        }
    }
}

writeStream.on('drain',()=>{
    console.log('!!! ---- 写入溢出');
    write();
})

writeStream.on('close',()=>{
    console.log('文件已经关闭');
})

write();