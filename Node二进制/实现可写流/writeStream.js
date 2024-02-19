/*****
 * 
 * 文件的可写流
 *  1. 内部也是基于events模块实现的
 *  2. 假设文件不存在会首先创建文件
 *  3. 默认会清空之前的文件并开始写入
 * 
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname,'./index.txt');

/**
 * 创建一个可写流 本身并不会写入文件
 * 
 * filePath 路径
 * options 配置对象
 *      flags 写入操作
 *      encoding
 *      mode 权限 八进制 可读可写
 *      autoClose 写入完成之后是否自动关闭流
 *      start 开始位置 包含前
 *      highWaterMark 预期内存 基于这个值来控制写入的速率
 * 
 * 注意：highWaterMark代表的是写入的时候预期占用多少内存空间
 *      一般这里给默认值16*1024 而不是表示每次写入多少字节 不会影响用户的写入
 *      执行write或end方法的时候会返回一个布尔值flag，每次都会判断预期内存时候大于实际累加写入的大小
 *      如果是 那么返回true 否则返回false
 */
const writeStream = fs.createWriteStream(filePath,{
    flags:'w',
    encoding:'utf-8',
    mode:0o666, 
    autoClose:true,
    start:0,
    highWaterMark: 15
})

/****
 *  可写流的特点：
 *  1. 写入的内容必须为string或者buffer 其他类型会报错
 *  2. write和end方法都是异步的，并且会将它们的回调放入一个队列，等待写入完成只好依次执行
 *  3. 内部会维护一个变量来统计写入的个数，当达到highWaterMark时返回false
 *  4. 但是当内容写入完成之后，内存被清空，此时再去写那么又从0开始计数
 */

writeStream.write('土猫儿',()=>{
    console.log('土猫儿写入成功');
})

writeStream.write('乖111',()=>{
    console.log('乖乖1写入成功');
})

// writeStream.write('乖乖2',()=>{
//     console.log('乖乖2写入成功');
// })

/****
 * 调用end方法会在内部执行文件关闭操作
 * 1. 如果参数有值 那么会先调用一次write方法写入然后fs.close关闭
 * 2. 如果参数无值 直接fs.close关闭
 */
writeStream.end('over',()=>{
    console.log('写入完毕！');
});

/****
 * 
 * drain事件触发时机：
 * 1. 写入的个数必须大于或者等于一开始的highWaterMark
 * 2. 内存中的内容全部清空之后会触发
 * 3. drain在英文中是排水 耗尽的意思
 * 
 */
writeStream.on('drain',()=>{
    console.log('立即触发！！！待写入字节大小已经超过预期');
})

/****
 * writeStream.end方法执行之后触发close事件
 * 执行fs.close操作
 */
writeStream.on('close',()=>{
    console.log('立即触发！！！待写入字节大小已经超过预期');
})



