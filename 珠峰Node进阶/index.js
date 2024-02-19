// process

console.log(process.cwd()); // C:\Users\克林辣舞\Desktop\NodeJS

console.log(__dirname) // c:\Users\克林辣舞\Desktop\NodeJS\珠峰Node进阶

setTimeout(()=>{
    console.log('111');
})

process.nextTick(()=>{
    console.log('222');
})

queueMicrotask(()=>{
    console.log('333');
})