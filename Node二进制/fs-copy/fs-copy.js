/****
 * 实现一个需求：
 * 读取name.txt文件，但是每次读取3个字符便向另外一个文件中写入读取的3个字符
 * 不是一次性读取到内存之后再一次性写入
 * 而是一边读取一边写入
 * 
 * 这样的好处是不会淹没系统的可用内存 合理分配读写内存
 * 每次写入都会覆盖之前的内容 也就是清空之前的内容重新写入
 */
const fs = require('fs');
const path = require("path");

/**
 * 
 * @param {*} sourcePath 源路径
 * @param {*} targetPath 目标路径
 * @param {*} callback 拷贝成功或者失败之后触发的回调函数
 */
function copy(sourcePath,targetPath,callback){
    let readOffset = 0;
    let writeOffset = 0;
    const SIZE = 5;
    const buffer = Buffer.alloc(SIZE);
    // 先打开要读取的文件
    fs.open(sourcePath,'r',(err,readFd)=>{
        if(err){
            return callback(err);
        }
        // 再打开要写入的文件
        fs.open(targetPath,'w',(err,writeFd)=>{
            if(err){
                return callback(err);
            }

            function next(){
                /**
                 * readFd 读取的目标文件描述符
                 * 
                 * 下面三个参数的意思是每次在缓冲buffer中存放5个字节的数据
                 * buffer 存储读取到的内容的缓冲buffer
                 * bufferOffset 从缓冲buffer的第0个位置开始存储读到的字节
                 * bufferLength 存储到buffer中的字节长度
                 * 
                 * filePosition 文件读取开始的位置 需要每次进行偏移 0 5 10 15 18
                 * bytesRead 实际存储到buffer中的字节长度 不一定等于预想的bufferLength
                 */
                fs.read(readFd,buffer,0,SIZE,readOffset,(err,bytesRead)=>{
                    if(err){
                        return callback(err);
                    }
                    readOffset += bytesRead;
                    console.log('缓冲buffer存入内容',buffer.length,bytesRead);

                    /****
                     * writeFd 要写入的文件描述符
                     * 
                     * buffer 缓冲待写入数据的buffer
                     * bufPosition ：0  待写入数据在缓冲区的起始位置
                     * writbufLength：SIZE   待写入数据的长度
                     * 
                     * filePosition 从文件的什么位置开始将缓冲buffer中的数据依次写入 需要每次进行偏移
                     * 
                     * bytesWritten 实际写入的数据字节长度
                     */
                    fs.write(writeFd,buffer,0,SIZE,writeOffset,(err,bytesWritten)=>{
                        if(err){
                            return callback(err);
                        }
                        writeOffset += bytesWritten;
                        console.log('缓冲buffer取出内容',buffer.length,bytesWritten);

                        // 如果某次读取到的字节长度不等于SIZE 说明读取完了 此时终止异步迭代
                        if(bytesRead !== SIZE){
                            fs.close(readFd,()=>{});
                            fs.close(writeFd,()=>{})
                            return callback();
                        }else{
                            next();
                        }
                    })
                })
            }
            next();
        })
    })

}


const sourcePath = path.resolve(__dirname,'./密码链接说明.txt');
const targetPath = path.resolve(__dirname,'./target.md');
copy(sourcePath,targetPath,(err)=>{
    if(err){
        console.error(err.message);
        return;
    }
    console.log('fs-copy 拷贝文件成功');
})