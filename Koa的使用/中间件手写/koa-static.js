const path = require("path");
const mime = require("mime");
const fs = require("fs").promises;

function koaStatic(rootPath) {
    console.log('rootPath',rootPath);
  return async function (ctx, next) {
    // 请求路径和静态服务root路径进行拼接
    console.log('ctx',ctx.path);
    const filePath = path.join(rootPath, ctx.path);

    console.log('filePath',filePath);

    try {
      const statObj = await fs.stat(filePath);

      if(statObj.isFile()){
        // 如果是文件自己进行处理
        // 获取mime类型
        ctx.type = mime.getType(filePath) + '; charset=utf-8';

        // 读取文件资源返回 
        ctx.body = await fs.readFile(filePath);

        // 到这一步就ok 不用再next了后面 请求到此结束

      }else{
        // 如果是文件夹直接下一步
        await next()
      }
    } catch (error) {
        // 报错直接下一步
        await next()
    }
  };
}

module.exports = koaStatic;
