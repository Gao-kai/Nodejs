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
     * 协商缓存 基于修改时间来实现的
     * 服务端：Last-Modified
     * 客户端：if-modified-since
     * 
     * 缺点：
     * 1. 服务端修改一个文件为a然后改为b又改回去a 此时文件其实没变 但是修改时间变了 此时访问会重新发请求
     * 2. 是精确到秒级的修改时间 如果在秒内修改了文件是无法检测到的 
     * 
     * 
     */

    // 无论是协商还是强制 必须开启缓存
    res.setHeader('Cache-Control','no-cache');
    // 读取时候有if-modified-since请求头 如果有 说明之前请求过服务端设置了last modifiy的响应头
    let ifModifiedSince = req.headers['if-modified-since'];


    try {
        let stat = await fs.stat(filePath);

        // 获取文件的创建时间
        let lastModified = stat.ctime.toISOString();

        // 每次请求来都进行协商对比
        if(lastModified === ifModifiedSince){
            // 说明没修改 返回304
            res.statusCode = 304;
            res.end();
            return;
        }

        // 放入响应头
        res.setHeader('Last-Modified',lastModified)

        if (stat.isFile()) {
            createReadStream(filePath).pipe(res);
        }else{
            // 如果找文件夹 这里暂时不做处理 
           throw new Error();
        }
    } catch (error) {
        console.log(error);
        res.statusCode = 404;
        return res.end("404 not found");
    }
})

server.listen(3000);