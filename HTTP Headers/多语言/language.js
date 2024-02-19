const fs = require("fs").promises;
const { createReadStream, createWriteStream, readFileSync } = require("fs");
const path = require("path");
const url = require("url");
const http = require("http");
const mime = require("mime");
const querystring = require('querystring')

/****
 * 
 * 国际化多语言一般有3种思路去实现：
 * 1. 基于不同的网站请求地址返回不同的页面，比如nodejs的官网：
 *    英文官网：  https://nodejs.org/en 返回index.html就是英文写的
 *    中文官网：  https://nodejs.org/zh-cn  同理 返回的index.html就是中文写的
 * 
 * 2. 基于前端来写 适合前端页面部分模块希望做国际化 采用i18n库来实现
 * 
 * 3. 基于请求头来实现
 *    客户端请求时配置请求头Accept-Language中各个语言及其对应的权重
 *    服务端解析客户端支持的语言和权重之后按照权重返回对应语言的资源
 * 
 */

// 多语言json
const messages = {
    "en":{
        message:'hello'
    },
    "zh-CN":{
        message:'你好'
    },
    "espan":{
        message:'Hola'
    }
}


const server = http.createServer(async (req,res)=>{

    // 获取请求路径
    let { pathname } = url.parse(req.url);

    // 拼接请求资源路径
    let filePath = path.join(__dirname, decodeURIComponent(pathname));

    try {
        let stat = await fs.stat(filePath);
        if (stat.isFile()) {
            res.setHeader("Content-Type", mime.getType(filePath) + ";charset=utf-8");

            // 解析请求头 req中的请求头都是小写
            let langHeader = req.headers['accept-language'];
          
            if(langHeader){
                /**
                 * querystring.parse方法
                 * 
                 * 参数1 表示要解析的字符串
                 * 参数2 ，表示分为几组键值对 比如http请求中的&符号 默认是&
                 * 参数3 ; 表示将键值对进行分割 并转化为对象的key-value
                 */
                let parseObj = querystring.parse(langHeader,',',';');
                console.log(parseObj);
                let langList = [];

                // 将解析结果进一步解析为对象数组并按照权重进行排序
                Object.keys(parseObj).forEach(key=>{
                    if(parseObj[key]){
                        langList.push({
                            name:key,
                            q:parseObj[key].split('=')[1]
                        })
                    }else{
                        langList.push({
                            name:key,
                            q:1
                        })
                    }
                })

                // 按照权重排序
                langList.sort((a,b)=>b.q - a.q);

                // 按照客户端设置的语言权重从服务端的语言配置json中读取字段返回
                for (let i = 0; i < langList.length; i++) {
                    const item = langList[i];
                    if(messages[item.name]){
                        return res.end(messages[item.name]?.message)
                    }
                }
            }
            // 全部循环完还没有匹配到 返回默认的中文
            return res.end(messages['zh-CN']?.message)
        } else {
            res.end('404 not found1')
        }
      } catch (error) {
        console.log(error);
        return res.end('获取资源失败')
      }

});

server.listen(3000);