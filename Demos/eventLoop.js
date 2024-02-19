/**
 * Node中的事件循环和浏览器的事件循环有什么不同
 * 1. 浏览器把所有宏任务放到一个队列中 node是分类将不同的宏任务放到不同的队列中
 * 
 *  + times 定时器相关的回调 setTimeout setInterval
 *  + pengding callbacks 用户无法自己操作 node会将上一个事件循环中未执行完成的任务放到这里
 *  + idle，prepare node内部自己调用 用户无法操作 也就是代码无法控制的
 *  + poll 轮询 执行文件操作 fs相关的 一般会在阻塞 假设这里读取一个文件耗时5秒 文件读取完成之后 执行回调
 *  + check setImmediate
 *  + close callbacks 主要是一些socket关闭的回调
 * 
 *  Node会检查所有队列是否还有需要被执行的回调函数，也就是是否还在等待异步I/O或定时器，如果没有的话那么就关闭这个事件循环的进程
 *  默认先从timer队列中依次执行callback 依次执行完成之后会接着执行下一个队列
 *  
 */


/**
 * 
 * setTimeout和setImmediate不同
 * 1. 如果没有poll任务 那么两者触发是不确定的 受进程性能影响
 * 2. setImmediate一定在当次poll任务结束之后执行
 * 3. setTimeout则在定时器到达后执行
 * 
 * 
 */



/**
 * 
 * 下面两种执行时机不一定：
 * PS C:\Users\克林辣舞\Desktop\NodeJS\Demos> node .\eventLoop.js
    setTimeout
    setImmediate

    PS C:\Users\克林辣舞\Desktop\NodeJS\Demos> node .\eventLoop.js
    setImmediate
    setTimeout
 * 
    setTimeout(()=>{
    console.log('setTimeout');
},0)

setImmediate(()=>{
    console.log('setImmediate');
})
 * 
 */

    /**
 * 
 * 下面两种执行时机一定 因为fs是poll队列回调 setImmediate一定在其之后执行
const fs = require('fs')
fs.readFile('./index.js',(err)=>{
    setTimeout(()=>{
        console.log('setTimeout');
    },0)
    
    setImmediate(()=>{
        console.log('setImmediate');
    })
})
 * 
 */


/**
 * 
 * process.nextTick并不是node事件循环的一部分 而是一个微任务
 * 它代表在本轮代码执行后执行 优先级高 比promise.then还要快一点
 * 
 */



const fs = require('fs')
fs.readFile('./index.js',(err)=>{
    setTimeout(()=>{
        console.log('setTimeout2');
    },0)
    
    setImmediate(()=>{
        console.log('setImmediate');
    })
})

setTimeout(()=>{
    console.log('setTimeout1');
},0)

Promise.resolve().then(()=>{
    console.log('then');
})

process.nextTick(()=>{
    console.log('nextTick');
})


/**
 * nextTick
then
setTimeout1
setImmediate
setTimeout2   
 */


/**
 * vue的nexttick源码中描述了常见的宏任务和微任务：
 * 
 * 宏任务 异步的
 *  script脚本执行
 *  ui渲染
 *  setTimeout
 *  setInterval
 *  setImmediate 仅IE可用
 *  
 *  宏任务 同步的
 *     ajax回调
 *     dom事件回调
 *  微任务 一般都是语言本身提供的
 *      promsie.then
 *      MutationObserver
 *      process.nextTick
 *      queueMicrotask
 * 
 * 
 */
