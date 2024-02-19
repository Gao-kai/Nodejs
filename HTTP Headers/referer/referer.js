/****
 * Referer字段
 * 
 * 1. 是什么
 * 当我们自己开发的网站假设部署在www.node.com上，我们的index.html中可能使用了iframe、img、video等资源
 * 并且这些资源不是来自我们自己的服务器 而是来自于www.baidu.com这个服务器
 * 我们每次向百度服务器获取图片 视频等资源的时候都会发送http请求 
 * 在请求的过程中浏览器为了让百度服务端知道是谁在获取该服务器的资源，就会在请求头中添加一个头：
 * referer:www.node.com
 * 
 * 也就是请求到达百度服务器之后告诉百度服务端，来自www.node.com站点的网站正在获取你服务器上的资源
 * 如果百度服务器同意 那么就可以拿走资源；否则就可以拒绝该请求
 * 
 * 这至少可以有两个作用：
 * 
 * 1. 图片防盗链
 * 原理就是读取请求头referer的值，看和自己是不是同一个域，如果是就返回资源 否则直接拒绝
 * 2. 发ajax请求的时候 防止csrf攻击 来自其他站点的ajax请求直接屏蔽
 * 
 * 什么时候才有referer头？
 * 
 * + 如果资源直接在浏览器打开不会有 也就是请求不是从站点发起的
 * + 请求方在请求资源的时候 meta标签设置了no-referer策略为none 此时浏览器不会发 
 *  <meta name="referer" content="never">
 *  这种方法不推荐 会导致发送任何资源都不带有referer请求头
 * + file协议没有这个头 只有http协议才有
 * 
 * 写法
 * referrer 这才是正确的 
 * referer 错误的 但是一开始2626规范写错了就将错就错
 * 
 * C:\Windows\System32\drivers\etc\hosts
 * Win+R->cmd->ipconfig /flushdns 
 * ipconfig /displaydns 看时候解析成功
 * 记事本打开编辑 
 */

const fs = require("fs").promises;
const { createReadStream, createWriteStream, readFileSync } = require("fs");
const path = require("path");
const url = require("url");
const http = require("http");
const mime = require("mime");


const server = http.createServer(async (req,res)=>{

    let { pathname } = url.parse(req.url);
    pathname = decodeURIComponent(pathname);
    let filePath = path.join(__dirname, pathname);


              
    try {
        let stat = await fs.stat(filePath);
       
        if (stat.isFile()) {
            
            // 如果图片要看referer来源时候是自己域的 不是的话就直接给拒绝了
            if(/\.webp/g.test(filePath)){

                // 先取出请求头中的referer的值 这个值是一个带有协议 域名 和路径的完整url 类似：http://127.0.0.1:5500/
                // 这种方法不能完全防御 因为用户在请求的时候可以自定义请求头referer
                let refererValue = req.headers['referer'] || req.headers['referrer']

                if(refererValue){
                    // 解析取到的refererValue 这个url 取出它的域名
                    let otherHost = url.parse(refererValue).host;
                    // 取出自己服务器的域名
                    let myHost = req.headers.host

                    console.log(otherHost,myHost);
                    // 对比不同返回错误信息
                    if(otherHost !== myHost){
                        createReadStream('./sad.webp').pipe(res);
                        return;
                    }

                }
            }
            createReadStream(filePath).pipe(res);
        } else {
            res.end('404 not found')
        }
      } catch (error) {
        res.end('获取资源失败')
      }

});

server.listen(3000);