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
// node核心模块 加密模块
const crypto = require('crypto')
const { createReadStream, createWriteStream, readFileSync } = require("fs");



server = http.createServer(async(req, res) => {
    const { pathname } = url.parse(req.url);    
    let filePath = path.join(__dirname, pathname);
    console.log('pathname',pathname);

    /****
     * 协商缓存 基于修改时间来实现的
     * 服务端：Etag
     * 客户端：if-none-match
     * 
     * 缺点：
     * 1. 虽然比较精准 但是默认我们不会根据完整内容生成hash值 因为这样太消耗性能了
     * 2. 所以我们会选择一部分文件来实现hash生成 一般为文件一部分 + 文件的总大小
     * 
     * MD5摘要算法：
     * 1. 不是加密算法，是摘要算法，也就是加密之后不可逆解密
     * 2. 不同内容转化的结果不相同，无论是大小还是长度
     * 3. 相同内容转化后的结果一定相同
     * 4. 雪崩效应 只要内容有一点点变化 那么结果大大不同
     * 
     */

    // 无论是协商还是强制 必须开启缓存
    res.setHeader('Cache-Control','no-cache');

    // 读取时候有if-none-match请求头 如果有 说明之前请求过服务端设置了Etag的响应头
    let ifNoneMatch = req.headers['if-none-match'];


    try {
        let stat = await fs.stat(filePath);

        // 读取文件最新buffer
        const content = await fs.readFile(filePath)

        // 必须每次产生一个hash实例 用于生成文件hash摘要
        const hash = crypto.createHash('md5');
        // 基于MD5摘要算法生成文件唯一最新hash base64
        const contentHash =  hash.update(content).digest('base64');

        console.log('contentHash',contentHash);

         // 每次请求来都进行协商对比 如果文件hash一样 那么返回304
         if(ifNoneMatch === contentHash){
            // 说明没修改 返回304
            res.statusCode = 304;
            res.end();
            return;
        }

        // 设置响应头 返回文件
        res.setHeader('Etag',contentHash)

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