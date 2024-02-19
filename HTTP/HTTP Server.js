/****
 * node中实现文件变化后自动重新运行
 * 1. nodemon
 * node monitor的简称 可以监视文件变化 让node自动重启和打包
 * 2. pm2
 * 
 * curl:curl是一个使用URL语法传输数据的命令行工具 可以在命令行发送请求且接受响应
 * 
 * curl命令
 * 
 * 使用curl -h查看常用参数使用
使用curl --help all查看全部参数使用

 * -X 请求方式
 * -H 请求头
 * -d 请求数据
 * - v 显示请求报文详情
 * 
 */
const http = require('http');
const url = require('url');

server = http.createServer((req,res)=>{


    /****
     * req请求对象详解
     * 1. req.method 请求方法 是大写的
     * 2. req.httpVersion http协议版本
     * 3. req.headers 请求头对象 都是小写的
     * 4. req.url 请求资源路径 
     *      1. 不接受哈希值 比如浏览器请求https:// www.xxx.com/file?a=1&b=2#demo 此时的req.url只是/file?a=1&b=2 不会有#demo
     *      2. 但是我们想要/file?a=1&b=2中的/file就好了 后面的查询参数希望解析为对象进行操作 此时就要用到node核心模块url
     *      3. url.parse(req.url,true) 就会自动解析路径 并且将query字符串转化为json对象 返回值是一个对象 内部有很多属性
     *              + pathname 请求url路径
     *              + query 查询对象 
     *              + ...
     *              protocol: null,
                    slashes: null,
                    auth: null,
                    host: null,
                    port: null,
                    hostname: null,
                    hash: null,
                    search: null,
                    query: [Object: null prototype] {},
                    pathname: '/',
                    path: '/',
                    href: '/'
    * 
    */
    
    
    /*****
     * req是一个可读流，因为无论浏览器传递的请求体是什么格式，在tcp中传输报文的时候都是二进制的数据
     * 所以我们基于可读流去读取数据
     * 
     *  
     *  1. data事件
     *  必须得有请求体 内部才会解析数据并触发data事件
     *  req.on('data',(data)=>{}) 监听文件流读取
     *      data事件每次触发都会有buffer进来，此时需要将buffer保存到一个数组中 便于后期处理
     *      end事件触发后代表buffer传输完毕 此时Buffer.concat(arr)进行合并
     *      最后调用buffer.toString方法转化为字符串
     *  
     * 
     *  2. end事件
     *  请求到达之后一定会触发end事件
     *  如果是get请求 会直接触发end事件 因为
     *  req.on('end',()=>{}) 监听文件流读取结束
     * 
     * 
     */
    const {pathname,query} = url.parse(req.url,true)

    const bufferList = [];
    req.on('data',(chunk)=>{
        console.log('请求报文传输中',chunk)
        bufferList.push(chunk);
    })

    req.on('end',()=>{
        
        const str = Buffer.concat(bufferList).toString();
        console.log('请求报文传输完毕',str)
    })

    /****
     * res是一个Node中的可写流
     * 1. write代表写入内容到响应报文中 
     * 2. 写入的内容必须为string或者buffer格式的
     * 3. end方法代表写入完成 不能再去调用write了 如果接续写入write就会爆粗
     *    因为end方法等于write加上fs.close方法 文件已经关闭了 此时就不该再去操作写入了
     * 4. 可以设置响应码 响应描述信息 编码
     */
    // res.write('hello');
    res.setHeader('a','111');
    res.setHeader('Content-Type','text/html;charset=utf8')
    res.statusCode = 200;
    res.statusMessage = 'OK 666'
    res.end('world');

})


let port = 3000;


server.listen(port,()=>{
    console.log('本地http服务创建成功!',port);
});
/****
 * 解决端口号被占用自动重启的方法
 * 
 * Node中基本上所有模块都继承自events模块
 * 所以都具备了事件监听的能力
 * 这里主要是解决一个问题 只要监听到服务报错 那么就给port自动加1重新创建一个http服务
 * 因为有可能出现端口号占用而报错的情况 
 */
server.on('error',(err)=>{
    if(err.code === 'EADDRINUSE'){
        server.listen(port++);
    }
})