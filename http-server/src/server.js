/**
 * node core module
 */
const fs = require("fs").promises;
const { createReadStream, createWriteStream, readFileSync } = require("fs");
const path = require("path");
const url = require("url");
const http = require("http");
const util = require("util");
const zlib = require("zlib");
const crypto = require('crypto');

/**
 * 程序启动时就读取模板 避免多次读取
 */
const template = readFileSync(path.resolve(__dirname, "template.ejs"), "utf-8");

/**
 * node_modules
 */
const ejs = require("ejs");
const renderFile = util.promisify(ejs.renderFile);

/**
 * mime:基于文件后缀获取对应的mime类型
 *
 * mime a.js => application/javascript
 * mime a.text => text/plain
 */
const mime = require("mime");

/**
 * debug: 基于环境变量来打印的工具
 *
 * 为什么不用console？
 * 可以配置开发环境打印什么 生产环境打印什么 而不是去删除console
 *
 * 用法：核心是和process.env.DEBUG进行匹配
 * 在powershell中设置全局环境变量：$env:DEBUG='server'
 * 但是这里设置的是临时的环境变量 程序重启又会消失
 *
 * const debug = require('debug')('server');
 * 当我们在代码中写：debug('HELLO'); 此时就会读取系统的环境变量中是否有server
 * 如果有 就会在控制台打印出HELLO
 *
 * 如果配合chalk这个库 也就是粉笔的意思 可以在控制台打印出各种颜色的日志
 */
const debug = require("debug")("server");
const chalk = require("chalk");
const { log } = require("console");

class HttpServer {
  constructor(config) {
    this.port = config.port;
    this.host = config.host;
    this.directory = config.directory;
    this.template = template;
  }

  async handleRequest(req, res) {
    // 获取请求的路径并进行解码 防止前端请求路径中带中文或特殊字符
    let { pathname } = url.parse(req.url);
    pathname = decodeURIComponent(pathname);
    let filePath = path.join(this.directory, pathname);
    try {
      let stat = await fs.stat(filePath);
      if (stat.isFile()) {
        // 发送文件
        this.sendFile(req, res, filePath, stat);
      } else {
        // 文件夹 先尝试找index.html
        let defaultFilePath = path.join(filePath, "index.html");
        console.log("defaultFilePath", defaultFilePath);
        try {
          // 如果找到了index.html 那么立即返回
          stat = await fs.stat(defaultFilePath);
          this.sendFile(req, res, defaultFilePath, stat);
        } catch (error) {
          // 否则列出当前访问路径下的所有文件目录
          this.showFileList(req, res, filePath, stat, pathname);
        }
      }
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  async showFileList(req, res, filePath, stat, pathname) {
    try {
      // 读取目录包含的信息
      const dirs = await fs.readdir(filePath);
      console.log(dirs);

      const renderList = dirs.map((dir) => {
        return {
          // 为了实现浏览器点击文件名可以跳转 需要进行路径拼接 浏览器访问路径 + 文件名
          dirName: dir,
          href: path.join(pathname, dir),
        };
      });

      // 渲染列表 使用模板引擎将ejs模板渲染为html字符串
      let templateHtml = await ejs.render(
        this.template,
        { renderList },
        { async: true }
      );
      console.log(templateHtml);

      // 发送数据
      res.setHeader("Content-Type", "text/html;charset=utf-8");
      res.end(templateHtml);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  /**
   * 判断是否命中协商缓存
   * @param {*} req 
   * @param {*} res 
   * @param {*} filePath 
   * @param {*} stat 
   */
  async getCache(req, res, filePath, stat){
    // 设置强缓存
    res.setHeader('Expires',new Date(Date.now() + 10 *1000).toGMTString());
    res.setHeader('Cache-Control','max-age=10');

    // 获取文件指纹并设置响应头
    let content = await fs.readFile(filePath);
    let etag = crypto.createHash('md5').update(content).digest('base64');
    res.setHeader('Etag',etag);

    // 获取文件修改时间并设置
    let ctime = stat.ctime.toGMTString();
    res.setHeader('Last-Modified',ctime);


    // 读取请求头 看是否命中缓存
    let ifNoneMatch = req.headers['if-none-match'];
    let ifModifiedSince = req.headers['if-modified-since'];

    console.log(ifNoneMatch,etag);
    if(ifNoneMatch!==etag){
      return false;
    }

    console.log(ifModifiedSince,ctime);
    if(ifModifiedSince!==ctime){
      return false
    }

    return true;
  }

  /**
   * 服务端响应
   * @param {*} req
   * @param {*} res
   * @param {*} filePath
   * @param {*} stat
   */
  async sendFile(req, res, filePath, stat) {

    // 设置文件类型响应头
    res.setHeader("Content-Type", mime.getType(filePath) + ";charset=utf-8");

    // 设置缓存响应头
    const cache = await this.getCache(req, res, filePath, stat);
    console.log(cache);
    if(cache){
      res.statusCode = 304;
      res.end();
      return;
    }

    // 首先判断发请求的浏览器是否支持gzip 如果支持返回一个压缩转换流 否则返回false
    const gzip = this.isSupportGzip(req, res);
    if (gzip) {
      // 如果支持 那么添加响应头
      res.setHeader("Content-Encoding", "gzip");
      // 将文件压缩后再传回
      createReadStream(filePath).pipe(gzip).pipe(res);
    } else {
      createReadStream(filePath).pipe(res);
    }
  }

  /**
   * 是否支持gzip压缩
   * @param {*} req
   * @param {*} res
   * @returns
   */
  isSupportGzip(req, res, filePath, stat) {
    console.log(req.headers);

    if (
      req.headers["accept-encoding"] &&
      req.headers["accept-encoding"].includes("gzip")
    ) {
      return zlib.createGzip();
    }

    return false;
  }

  handleError(req, res, error) {
    // 在服务端控制台打印日志
    debug(chalk.red(error));

    // 客户端报错
    res.statusCode = 404;
    res.end("404 not found");
  }

  start() {
    /**
     * 原生的http-server实现是：
     * http.createServer方法接收的回调函数callback内部的this指向创建出来的server对象
     * 但是如果我们直接这样写：
     * const server = http.createServer(this.handleRequest);
     *
     * 由于 http.createServer方法规定了它的回调函数中的this一定指向自己创建出来的服务，所以这里
     * 当http.createServer方法执行的时候，它在内部执行回调的时候一定是：callback.call(this,...args);
     * 所以我们需要提前绑定this到HttpServer实例上，这样才可以正确读取到handleRequest
     *
     * 1. 提前绑定 this.handleRequest = this.handleRequest.bind(this)
     * 2. 箭头函数 http.createServer(((req,res))=>this.handleRequest(req,res));
     *
     * 这样做的目的就是在后续写handleRequest逻辑的时候，内部调用其他HttpServer实例方法时
     * 保证内部的this一定是HttpServer类的实例 而不是被http.createServer修改的server对象
     *
     */
    const server = http.createServer(this.handleRequest.bind(this));
    server.listen(this.port, this.host, () => {
      console.log(
        chalk.yellow(
          `Starting up http-server, serving ./${this.directory
            .split("\\")
            .pop()}`
        )
      );
      console.log(chalk.yellow("Available on:"));
      console.log(chalk.green(`    http://${this.host}:${this.port}`));
      console.log("Hit CTRL-C to stop the server");
    });
  }
}

module.exports = HttpServer;
