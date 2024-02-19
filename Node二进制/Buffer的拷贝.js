const fs = require('fs');

/****
 * 
 * path: fs.PathLike, 
 * flags: fs.OpenMode | undefined, 
 *  "r"    以读取模式打开；(如果文件不存在，会报错)
    "r+"   以读写模式打开；(如果文件不存在，会报错)
    "w"    以写入模式打开；(如果文件不存在，会创建新的文件) 默认会清空之前的内容
    "w+"   以读写模式打开；(如果文件不存在，会创建新的文件)
    "a"    以追加模式打开；(如果文件不存在，会创建新的文件)
    "a+"   以读取和追加模式打开(如果文件不存在，会创建新的文件)
 * mode: fs.Mode | null | undefined, 权限
 * callback: (
 *  err: NodeJS.ErrnoException | null, 错误对象
 *  fd: number 数字描述符
 * ) => void
 */
fs.open('./base64.txt',"a+",(err,fd)=>{
    if(!err){
        // 读取文件中的前三个字符 然后放入到一个buffer中
        let newBuffer = Buffer.alloc(9);

        /******
         * 读取：将文件中的二进制数据读取出来放到内存中 也就是newBuffer中 读取打开的文件
         * fd: number, 
         * buffer: NodeJS.ArrayBufferView, 读取出来要放入的buffer
         * offset: number, 目标buffer从哪里开始存储
         * length: number, 读取多长
         * position: fs.ReadPosition | null,读取开始的位置 
         * callback: (
         *      err: NodeJS.ErrnoException | null, 
         *      bytesRead: number, 实际读取了多少字节长度
         *      buffer: NodeJS.ArrayBufferView 读取的字节内容
         *      )
         */
        fs.read(fd,newBuffer,0,6,3,(err,bytesRead,buffer)=>{
            if(!err){
                console.log('bytesRead',bytesRead);
                console.log('buffer',buffer.toString());
                console.log('newBuffer',newBuffer.toString());

                /*****
                 * 写入：将内容newBuffer中的二进制数据写入到文件中 写入buffer到fd指定的文件；
                 * fd: number, 
                 * buffer: NodeJS.ArrayBufferView, 
                 * offset: number | null | undefined,  决定buffer中被写入的指定的位置
                 * length: number | null | undefined,  决定要写入的字节数
                 * position: number | null | undefined, buffer开始写入数据的偏移量
                 *  callback: (
                 *      err: NodeJS.ErrnoException | null, 
                 *      written: number, 
                 *      buffer: NodeJS.ArrayBufferView) => void 代表要写入的内容
                 *  )
                 * 
                 */
                fs.write(fd,newBuffer,0,6,0,(err,bytesWrite,buffer)=>{
                    if(!err){
                        console.log('bytesWrite',bytesWrite);
                        console.log('buffer',buffer.toString());
                        console.log('newBuffer',newBuffer.toString());
                    }
 
                })
            }
        })
    }
    
})