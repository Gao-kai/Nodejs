const fs = require('fs')
const path = require('path')
const url = require('url')
const http = require('http')


/*****
 * 
 * 1. 在开启http服务之后 后续的处理都应该是异步的 因为同步很明显会造成阻塞主线程 这里的主线程就是JS执行的线程，解决方法
 *      + 服务器集群
 *      + 子进程
 *    下面是一个很经典的案例 当我们访问/sum的时候 此时js单线程开始计算
 *     此后又访问了其他路径 但是服务端不会立即处理请求 而是由于同步阻塞的问题 会等待sum计算完成之后再处理
 * 
 * 2. res.end的参数必须是一个字符串或者buffer 常见的操作是拼接上一个空字符串
 * 3. pathname解析的结果会带上/ 此时直接用path.resolve会将/解析为盘符 所以应该用path.join
 */
const server = http.createServer((req,res)=>{
    // 解析请求路径
    const {pathname} = url.parse(req.url);
    // 拼接路径
    const filePath = path.join(__dirname,pathname); // C:\Users\克林辣舞\Desktop\NodeJS\HTTP\public\index.html
    console.log(filePath);
    if(pathname.includes('sum')){
        console.log('计算请求来了');
        let sum = 0;
        for (let i = 0; i < 10000000000; i++) {
            sum += i;
        }
        res.end(sum+"")
    }else{
        console.log('普通请求来了');
        res.end('直接返回')
    }
})


server.listen(3000,()=>{
    console.log('本地http服务创建成功!');
});
