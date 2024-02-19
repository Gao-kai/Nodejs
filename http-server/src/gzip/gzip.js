/****
 * 
 * 一般服务端常见的优化手段有两种：
 *  1. 压缩
 *  2. 缓存
 * 
 * 一般服务端常见的压缩算法为gzip压缩。
 *  前端可以通过webpackCompressPlugin插件对打包的静态资源进行压缩，用户直接请求的是压缩后比较小的资源
 *  后端可以在用户请求的时候将放在服务端的静态资源在通过http发送给前端的时候做一次压缩，减少传输带宽并且提高加载速度
 * 
 * node中默认支持了gzip压缩，通过核心模块zlib模块进行压缩
 * 压缩比的核心是对压缩文件中重复率比较高的，压缩率就高，因为重复的东西可以被抽取；而如果文件内的数据互相没有关系不重复，那么压缩比是比较低的
 * node中的zlib.gzip方法实现的思路就是通过替换相同数据来实现的，适合压缩文本类的数据，不适合音视频的数据
 */

const zlib = require('zlib');
const fs = require('fs');


/****
 * 第一种压缩方案：简单的压缩 一次性读取文件到内存中 然后进行压缩输出产物buffer 最后写入到文件中
 * 缺点是大文件的话占内存 所以想到基于流来实现
 */
zlib.gzip('./demo.txt',(err,data)=>{
    if(err) return;
    // 将压缩后的产物buffer data写入zip.txt
    fs.writeFileSync('./demo-zip.txt',data)

    // 接着读取压缩后文件大小 => 30 byte
    getFileSize('./demo-zip.txt')
})

function getFileSize(path) {
    fs.stat(path,(err,stat)=>{
        console.log(stat.size);
    })
}

// 压缩前读取文件大小 =>  5268 byte
getFileSize('./demo.txt') 



/****
 * 第二种压缩方案
 * 
 * 创建一个压缩转换流：将可读流持续读取的数据连续进行压缩，然后将压缩的产物通过可写流逐渐写入
 * 大文件压缩效率高 不占用内存
 * 
 * gzip压缩后默认的文件格式是gz
 * 
 * 压缩前demo.txt：6kb
 * 压缩后得到的产物：demo-zip.txt.gz 大小为1kb
 */
fs.createReadStream('./demo.txt').pipe(zlib.createGzip()).pipe(fs.createWriteStream('./demo-zip.txt.gz'))