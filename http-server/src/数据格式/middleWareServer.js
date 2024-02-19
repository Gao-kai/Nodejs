/****
 * 浏览器发送的请求一般分为两种：
 * 
 * 1. 普通资源请求 比如html、css、js等静态资源的请求，此时是通过src href等方式请求资源 不会有浏览器的跨域限制
 * 
 * 2. ajax请求 多数为页面数据请求 此时有跨域限制 那么如何解决呢？
 *  
 *  + cors配置响应头 最简单的方法
 *  + jsonp
 *  + 由node实现一个中间层，开发的时候提现为webpack-dev-server，在生产环境下大多数静态资源存放服务端和接口服务运行的都在同一ip上，所以不存在跨域
 *      但是一旦出现这种需求 那么可以基于中间层实现请求的跳板 由服务端向服务端发起请求 避开浏览器的跨域限制
 * 
 *  客户端 => node中间层 => java api服务
 *  
 * 
 */

const http = require("http");
     // 服务端8998创建一个请求 目标地址是3000
    let client = http.request({
        hostname:'localhost',
        port:3000,
        path:'/ajax',
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        }
    },(res)=>{
        // 请求成功会返回结果
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          console.log('No more data in response.');
        });
    })


    // 发送请求动作
    const requestBody = {name:'李雷'}
    client.end(JSON.stringify(requestBody))