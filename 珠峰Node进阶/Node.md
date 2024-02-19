## Node的优势

1. 相比于传统的服务端语言，需要不停的去开启线程还是回收线程，而Node是单线程的
多线程同步模型

高并发密集I/O型 有着特殊的优势 

多线程 同时处理多个任务 但是会导致浪费内存和创建多条线程

单线程 如果仅仅是读写文件或者调接口 那单线程可以只开一个线程 通过异步事件机制 不阻塞后续任务执行


Node不处理CPU密集型

解压
加密
压缩
解密

Node适合处理I/O密集型 解决高并发问题
文件操作
网络操作
数据库

Node一般做前后端分离的BFF层 服务于前端的后端


## 阻塞和非阻塞
指的是调用者调用了一个方法之后的状态 比如我调用了readFile之后是一直等还是可以去干其他事情

## 同步和异步
指的是被调用者告诉调用者它的方法是同步还是异步的，比如Node会告诉调用者readFile这个方法是异步的

## Node核心：非阻塞异步I/O
在Node中执行I/O操作的时候，这些方法都是异步的，调用者可以不用等待异步方法执行完成，可以直接去执行后面的事
等异步方法执行完成之后会通知调用者执行完成，触发回调函数。

## Node和前端的区别


## process全局对象的属性和方法
+ process.platflom 判断操作系统环境
+ process.argv 解析用户参数
+ process.cwd 当前工作目录 current working directory
当前文件在那个目录执行命令，就去这个文件目录下找配置文件 怎么实现？
其实就是基于 process.cwd实现的 这个值可以改 用户可以切换 工作目录也就是工程的根目录

```js
console.log(process.cwd()); // C:\Users\克林辣舞\Desktop\NodeJS 当前文件在系统中的工程目录
console.log(__dirname) // c:\Users\克林辣舞\Desktop\NodeJS\珠峰Node进阶 当前文件所在的父目录

```
+ process.env 环境变量
可以基于环境变量实现不同功能 比如不同环境下实现接口地址不同
设置临时的环境变量 窗口关闭就删除
window下 使用 set ket = value


+ process.nextTick 将回调放入下一次事件循环队列上
node中自己实现的微任务，除此之外还有一个node自己实现的微任务queneMicroTask
```js
setTimeout(()=>{
    console.log('111');
})

process.nextTick(()=>{
    console.log('222');
})

queueMicrotask(()=>{
    console.log('333');
})

```