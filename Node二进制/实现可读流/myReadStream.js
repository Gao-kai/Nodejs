const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

/**
 * 手写一个自己的可读流
 * @param {*} filePath 
 * @param {*} options 
 * 
 * core:
 * 1. 发布订阅实现了延迟执行
 * 2. 类的继承 super实现
 * 3. 难点：确定每次要读取多少字节的数据 防止超出用户给的end边界
 * 4. 发布订阅模式
 * 5. 之所以+1是因为读取时的end是包含末尾哪一位的字节的
 */
class ReadStream extends EventEmitter{
    constructor(filePath,options){
        super();
        this.filePath = filePath;

        this.flags = options.flags || 'r';
        this.encoding = options.encoding || null;
        this.mode = options.mode || 0o666;
        this.autoClose = options.autoClose || true;
        this.start = options.start || 0;
        this.end = options.end;
        // 默认每次读取64 * 1024字节也就是64kb的数据
        this.highWaterMark = options.highWaterMark || 64 * 1024;

        // 一开始new ReadStream的时候创建一个不流动的流 后续一旦监听到有人监听
        // data事件 才打开流让流进行传输
        this.flowing = false;

        this.on('newListener',(type)=>{
            if(type === 'data'){
                this.flowing = true;
                // 读取文件 但是如何保证一定在文件打开之后才读取？
                this.read();
            }
        })

        // 每次读取的偏移量 会递增
        this.readPosition = 0;

        // 打开文件
        this.open();

        // 打开文件的文件标识符
        this.fd = null;
    }

    open(){
        fs.open(this.filePath,this.flags,this.mode,(err,fd)=>{
            if(err){
                return this.emit('error',err);
            }
            this.fd =fd;
            this.emit('open',fd);
        })
    }

    /**
     * 实现管道方法 
     * 优点：不会淹没可用内存
     * 缺点：获取不到中间具体读写细节内容
     * @param {*} ws 可写流
     */
    pipe(ws){
        this.on('data',(data)=>{
            // 读取后直接写入
            let flag = ws.write(data)
          
            if(!flag){
                // 暂停读取流
                this.pause();
            }
        })
        
        ws.on('drain',(data)=>{
            // 缓存写入完毕 恢复读取流
            this.resume();
        })
    }

    // open是异步操作 如何保证read的时候open已经执行完毕呢？
    read(){
        if(typeof this.fd !== 'number'){
            this.once('open',()=>{
                this.read();
            })
            return;
        }

        // console.log('真的开始读取文件',this.fd);
        // 开始递归读取 核心是计算极限值
        const buffer = Buffer.alloc(this.highWaterMark);
        // 难点：确定每次要读取多少字节的数据 防止超出用户给的end边界 之所以+1是因为end是包含尾巴的 end=6说明要读取7个字节
        // 而readPosition从0开始加 假设也加到6 代表从索引为6的元素进行读取 还有一个元素需要读取
        const howMuchToRead = this.end? Math.min(this.end - this.readPosition + 1,this.highWaterMark) : this.highWaterMark;

        fs.read(this.fd,buffer,0,howMuchToRead,this.readPosition,(err,bytesRead)=>{
            if(err){
                return this.emit('error',err);
            }

            if(bytesRead){
                // 读取到的真实字节长度 加在偏移后面
                this.readPosition += bytesRead;
                // 参数是从buffer中截取的数据 而不是bytesRead bytesRead是数字没有意义
                this.emit('data',buffer.slice(0,bytesRead));

                // this.flowing为true才可以继续读取
                if(this.flowing){
                    this.read();
                }
            }else{
                 // 没内容读取了 触发end事件
                 this.emit('end');
                 if(this.autoClose){
                     fs.close(this.fd,()=>{
                         this.emit('close')
                     })
                 }
            }
        })

    }

    pause(){
        this.flowing = false;
    }

    resume(){
        this.flowing = true;
        this.read();
    }
}


const filePath = path.resolve(__dirname,'../fs-copy/密码链接说明.txt');
const rs = new ReadStream(filePath,{
    flags:'r',
    encoding:null,
    mode:0o666, 
    autoClose:true,
    start:0,
    end:20,
    highWaterMark:3
});

rs.on('open',(fd)=>{
    console.log('打开文件开始读取',fd);
})

rs.on('close',()=>{
    console.log('文件关闭');
})

let bufferList = [];
rs.on('data',(data)=>{
    rs.pause();
    setTimeout(()=>{
        rs.resume();
    },1000)
    console.log('本次读取到的data',data.toString());
    bufferList.push(data);
})


rs.on('end',()=>{
    console.log('读取完毕',Buffer.concat(bufferList).toString());
})


rs.on('error',(err)=>{
    console.log('读取文件出错',err);
})


module.exports = {
    ReadStream
};