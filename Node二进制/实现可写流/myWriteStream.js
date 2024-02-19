const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

/**
 * 手写一个自己的可写流
 * @param {*} filePath 
 * @param {*} options 
 * 
 * core:
 * 1. cache缓存空间的维护
 * 
 * 
 */
class WriteStream extends EventEmitter {
    constructor(filePath,options){
        super();
        this.filePath = filePath;

        this.flags = options.flags || 'w';
        this.encoding = options.encoding || 'utf-8';
        this.mode = options.mode || 0o666;
        this.autoClose = options.autoClose || true;
        this.start = options.start || 0;

        // 预期写入内存大小
        this.highWaterMark = options.highWaterMark || 16 * 1024;
        // 每次调用write方法之后 基于写入的内容的个数累加 也就是缓存的长度
        this.len = 0;
        // 时候需要触发一次drain事件
        this.needDrain = false;
        // 写入偏移
        this.offset = this.start;
        // 除了第一次写入之外 用来缓存多次写入操作
        this.cache = [];
        // 当前写入数据的时候 时候是正在写入
        this.writing = false;
        // 打开文件的文件标识符
        this.fd = null;

        this.open();
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
     * 
     * @param {*} chunk 写入的数据
     * @param {*} encoding 编码
     * @param {*} callback 回调
     * 
     * 1. 解决写入的数据只能是string或buffer的问题
     * 全部转为buffer之后再进行操作 保证后续操作的都是buffer 是统一的
     * 
     * 2. _write的包装写法
     * 直接使用write的话没法包装clearBuffer的逻辑
     */
    write(chunk,encoding="utf-8",callback = ()=>{}){
        chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        this.len += chunk.length;

        // write返回值
        let flag = this.len < this.highWaterMark;

        // drain事件的触发 必须满足写入的个数大于或者等于预期的highWaterMark
        this.needDrain = !flag;


        if(this.writing){
            // 正在写入 放入缓存
            this.cache.push({
                chunk,
                encoding,
                callback
            })
        }else{
            // 没有正在写入 那么就去写入
            // 首次进来先修改writing为true
            this.writing = true;
            // 真正执行写入逻辑 
            this._write(chunk,encoding,()=>{
                // 写完之后先执行用户传入的回调
                callback()

                // 当前第一个写完之后 需要清空缓存中的内容 就是去cache中取出执行
                this.clearBuffer()
            });
        }

        return flag;
    }


    clearBuffer(){
        let head = this.cache.shift();
        // head有值 说明缓存中海油需要清空的 依次进行情况
        if(head){
            const {chunk,encoding,callback} = head;
            // 递归
            this._write(chunk,encoding,()=>{
                callback();
                this.clearBuffer()
            });
        }else{
            // 取不出来值了 说明缓存中的写完了 做一个标识 后续假设再执行write方法 
            // 不会直接存缓存 而是先去真实的读第一个
            this.writing = false;

            if(this.needDrain){
                // 当前触发之后下次就不触发了
                this.needDrain = false;
                this.emit('drain')
            }
        }
    }

    _write(chunk,encoding,wrapCb){
        
        // 防止开始读取的时候  文件还没有打开完成
        if(typeof this.fd !== 'number'){
            this.once('open',()=>{
                this._write(chunk,encoding,wrapCb);
            })
            return;
        }

        fs.write(this.fd,chunk,0,chunk.length,this.offset,(err,written)=>{
            // 缓存的个数要减少
            this.len -= written;
            this.offset += written;

            // 写入成功 执行包装回调 => 执行用户传入的写入成功回调 => clearBuffer
            wrapCb()
        })
    }


}

const filePath = path.resolve(__dirname,'./MyWriteStream.txt');
const writeStream = new WriteStream(filePath,{
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

writeStream.write('土猫儿','utf-8',()=>{
    console.log('土猫儿写入成功');
})

writeStream.write('乖1','utf-8',()=>{
    console.log('乖乖1写入成功');
})

writeStream.write('乖乖2','utf-8',()=>{
    console.log('乖乖2写入成功');
})



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
    console.log('关闭');
})

