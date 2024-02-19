/****
 * 
 * 后端的缓存：
 *  1. 强制缓存
 *      + 默认状态码都是200
 *      + 以后的请求都不经过服务器，直接在浏览器端就返回结果
 * 
 *  2. 协商缓存
 *      + 经过服务器校验，会返回状态码304
 *      + Etag 指纹验证
 *      + Last Modifify 文件修改时间配置
 */
const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs").promises;
const { createReadStream, createWriteStream, readFileSync } = require("fs");



server = http.createServer(async(req, res) => {
    const { pathname } = url.parse(req.url);    
    let filePath = path.join(__dirname, pathname);
    console.log('pathname',pathname);

    /****
     * 强制缓存 Expires
     * 1. 老版本浏览器支持的
     * 2. 设置的是一个绝对时间 如下表示当前资源在当前时间+30分钟的那个绝对时间点以前都可以不用请求服务器直接访问
     * 3. 设置的值必须是一个字符串toGMTString
     * 
     * 强制缓存 Cache-Control
     * 1. 新版本浏览器支持的
     * 2. 设置的是一个相对于现在的时间 
     * 3. 值是字符串格式的键值对，表示距离第一次访问10s之内会强制缓存
     * 
     * 强制缓存策略：
     * 1. index.html首页默认是不进行强制缓存的 因为假设断网 如果强制缓存了还可以访问 这不合理
     *    并且首页中一般有引入其他资源的链接 一般打包哈希值都会变 如果index html强制缓存了
     *    那么就算重写部署了 用户访问还是之前页面
     * 
     * 2. 引用的其他静态资源才应该被强制缓存 比如js和css等 只要不重新打包部署 那么重复访问走缓存 速度要快很多
     * 
     * 缓存的位置
     * 1. memory cache
     * 已经访问过 并存在内存中 浏览器关闭后缓存消失  再次打开访问不会走cache
     * 
     * 2. disk cache
     * 之前的某个时间访问过 缓存在硬盘中 关闭浏览器后依旧存在
     * 
     */
    res.setHeader('Expires',new Date(Date.now() + 30 * 60 *1000).toGMTString());
    res.setHeader('Cache-Control','max-age=10') // 后续请求不走服务器 直接从前端获取
    // res.setHeader('Cache-Control','no-cache') // 会缓存 但是前端还是要每次请求服务器
    // res.setHeader('Cache-Control','no-store') // 压根不缓存 每次都要请求服务器


    try {
        let stat = await fs.stat(filePath);
        if (stat.isFile()) {
            createReadStream(filePath).pipe(res);
        }else{
            // 如果找文件夹 这里暂时不做处理 
           throw new Error();
        }
    } catch (error) {
        console.log(error);
        res.statusCode = 404;
        res.end("404 not found");
    }
})

server.listen(3000);