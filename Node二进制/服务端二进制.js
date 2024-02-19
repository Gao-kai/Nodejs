/****
 * 
 * 服务端的二进制代表对象就是二进制数据存放对象Buffer
 * 1. Buffer可以和字符串互相进行转化
 * 2. Buffer中存放的一定是二进制数据，只是为了方便表示用16进制进行表示
 * 3. Buffer不能进行扩容
 * 4. Buffer创建出来之后没有数组的多数方法 但是可以截取slice 这里也是浅拷贝 
 * 
 * 一、Bugegr的三种声明方式
 * 
 * 1. 基于字节长度来声明
 * const buffer1 = Buffer.alloc(8);
 * 
 * 2. 基于字符串转化而来
 * const buffer2 = Buffer.from('abcde')
 * 
 * 3. 手动输入
 * const buffer2 = Buffer.from([e3,65,10])
 * 
 * 二、属性和方法
 * 1. buffer.length
 * 2. Buffer.isBuffer(buffer)
 * 3. buffer.toString() buffer转化为字符串
 * 4. buffer.slice()
 * 5. buffer.copy(targetBuffer,targetStart,sourceStart,sourceEnd) 
 *      将buffer从sourceStart开始拷贝到sourceEnd，然后依次赋值给目标targetBuffer，从目标targetBuffer的targetStart开始
 *      核心就是创建一个更大的buffer实例 然后将源buffer依次拷贝过去
 * 6. Buffer.concat([buf1,buf2,...],length) 
 *      原理还是copy length假设不传递会默认是buffer列表中的所有字节长度之和
 * 7. buffer.indexOf()
 */


/*****
 * buffer有关的文件操作：
 * 1. 索引修改
 * 2. 更改全部内容
 * 3. 拼接buffer
 * 
 * 三、BUffer拼接有什么优势
 * 前端分片上传文件的时候，我们需要将传输过来的二进制数据进行拼接，这个二进制是无法直接调用toString转化为字符串的
 * 前端断点续传
 * 传递的不是字符串格式的数据 有可能是其他类型的格式 但是底层都是buffer
 * 
 */
const buffer1 = Buffer.from("土猫儿");
const buffer2 = Buffer.from("乖乖");
console.log(buffer1,buffer2);
let bigBuffer = Buffer.alloc(buffer1.length + buffer2.length);
console.log(bigBuffer);
Buffer.prototype.copy = function(targetBuffer,targetStart,sourceStart,sourceEnd){
    console.log('ssssss');
    for (let i = sourceStart; i < sourceEnd; i++) {
        targetBuffer[targetStart] = this[i];
        targetStart++;
    }
}
buffer1.copy(bigBuffer,0,0,9);
buffer2.copy(bigBuffer,9,0,6);
console.log('bigBuffer',bigBuffer);

Buffer.concat = function(bufferList,length){
    // 默认不传递为所有列表中之和
    length = length || bufferList.reduce((a,b)=>a.length + b.length);

    // 创建新buffer 长度为length
    let newBuffer = Buffer.alloc(length);
    let offest = 0;
    bufferList.forEach(buffer=>{
        // 拷贝一个
        buffer.copy(newBuffer,offest);
        // 增加偏移
        offest += buffer.length;
    })

    // 全部拷贝完成之后 将多余的空间截取 
    return newBuffer.slice(0,offest)
}