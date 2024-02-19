const querystring = require("querystring");
require("./bufferSplit");
const uuid = require('uuid')
const fs = require('fs')
const path = require('path')

/**
 * 手写bodyParser
 * 1. 执行返回async函数
 * 2. 里面需要等待解析请求体完成
 * 3. 完成之后为了可以执行下一个中间件 必须要再次await next
 * 4. 其实就是将body请求体基于不同的数据类型解析之后挂载到 ctx.request.body山
 */
function bodyParser(uploadDir) {
  return async function (ctx, next) {
    await new Promise((resolve, reject) => {
      const bufferList = [];
      ctx.req.on("data", (chunk) => {
        bufferList.push(chunk);
      });

      ctx.req.on("end", () => {

        // 如果用户提交表单对象 那么解析为对象之后挂载到 ctx.request.body 山
        if (ctx.get("content-type") === "application/x-www-form-urlencoded") {
          let res = Buffer.concat(bufferList).toString();
          ctx.request.body = querystring.parse(res);
        }

        /****
         * 如果用户提交的是form-data 可能请求体中有图片等文件资源 就不能简单的toString
         * 需要做buffer的分隔和抽取
         * 
         * 此时前端传递的是：
         * ------WebKitFormBoundaryJFhmx6v9n4uSA1za
            Content-Disposition: form-data; name="username"

            name111
            ------WebKitFormBoundaryJFhmx6v9n4uSA1za
            Content-Disposition: form-data; name="password"

            112344
            ------WebKitFormBoundaryJFhmx6v9n4uSA1za
            Content-Disposition: form-data; name="txt"; filename="1.txt"
            Content-Type: text/plain


            ------WebKitFormBoundaryJFhmx6v9n4uSA1za
            Content-Disposition: form-data; name="image"; filename="微信图片_20230511102029.jpg"
            Content-Type: image/jpeg


            ------WebKitFormBoundaryJFhmx6v9n4uSA1za--

            此时请求头Content-Type的值为：multipart/form-data; boundary=----WebKitFormBoundaryJFhmx6v9n4uSA1za
            告诉服务器两个信息：
            1. 本次传输的数据格式是multipart/form-data; 
            2. 每个data的分隔符boundary是----WebKitFormBoundaryJFhmx6v9n4uSA1za 注意前面是四个横线-

            那么后端的解决思路就是：
            1. 先获取分隔符
            2. 基于分隔符将所有数据也就是buffer进行分割
            3. 分割的每一个部分都放到数组中
            4. 然后通过Buffer.concat合并
            * 
            */
           
        if (ctx.get("content-type").includes("multipart/form-data")) {
          // 获取分隔符
          let boundary = ctx.get("content-type").split("=")[1];

          // 基于分隔符将所有数据也就是buffer进行分割
          let buffer = Buffer.concat(bufferList);


          // 注意后端拿到的分隔符是6个横线  前端传递的是4个
          let result = buffer.split("--" + boundary);
          // 注意这里拿到的分隔后的buffer 头部是空buffer 尾部是结尾标识两个--和一个换行符 头尾我们都不要
          result = result.slice(1,-1)

          console.log("最终服务器收到的有效结果buffer是", result);

          const parseObj = {};

          result.forEach(buffer=>{
    
            // 因为每一个buffer中组成部分是head和body组成 所以再次进行分割 分割符是固定的连续的两个回车符和换行符
            let [head,body] = buffer.split('\r\n\r\n');

            // 将head转为字符串 然后先读取name属性 最后基于是否包含filename字段分为文件上传和普通数据
            // .表示数字字母下换线 +表示一个到多个 ?表示惰性匹配 最后获取到的就是head中name的值组成的数组
            // 正则不能加g修饰符 否则会出现不一样的行为
            head =  head.toString()
            let key = head.match(/name="(.+?)"/)[1];

           
            if(head.includes('filename')){
                // 先截取文件的buffer +4是因为head之后有4个符号 获取文件长度
                let fileContent = buffer.slice(head.length+4,-2);

                // 获取上传路径 拼接一个随机值 避免重复
                let filePath = path.join(uploadDir,uuid.v4())

                parseObj[key] = {
                    type:"file",
                    filePath,
                    size:fileContent.length
                }

                // 写入到服务器
                fs.writeFileSync(filePath,fileContent)

            }else{
                // -2是因为末尾由两个/n/r组成
                parseObj[key] = body.toString().slice(0,-2);
            }
          })

          ctx.request.body = parseObj
          
        }

        resolve();
      });
    });

    await next();


  };
}

module.exports = bodyParser;
