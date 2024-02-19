const http = require("http");
const url = require("url");
const querystring = require("querystring");

/*****
 * 
 * 下面这种写法非常冗余 不好规划代码
 * 所以需要采用中间件的方式来实现
 */
server = http.createServer((req, res) => {
  // 获取请求的路径
  const { pathname } = url.parse(req.url);
  /****
   * 跨域请求的处理
   */
  res.setHeader('Access-Control-Allow-Origin',req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT')
  // 在预检请求中，服务器可以返回Access-Control-Max-Age头部告知浏览器，在接下来的一段时间内该请求可以被允许访问，避免频繁发送预检请求。值得注意的是，Access-Control-Max-Age的值为0时表示禁用缓存，每次请求都会发送预检请求。
  res.setHeader('Access-Control-Max-Age','30')

  // 处理ajax的跨域预检请求 非post和get请求 或者添加了自定义请求头的请求会被认为是非简单请求
  if(req.method === 'OPTIONS'){
    res.statusCode = 200;
    res.end();
  }

  /**
   *
   * 解析请求体
   * 基于客户端请求的下列信息，服务端需要按照要求转化数据并作出不同的响应：
   * 1. 请求路径
   * 2. 请求方法
   * 3. 数据类型content-type
   *
   */
  const bufferList = [];

  // post请求才会触发data
  req.on("data", (chunk) => {
    bufferList.push(chunk);
  });

  req.on("end", () => {
    const body = Buffer.concat(bufferList).toString();
    console.log("前端的请求体是", body);

    // 1.如果是表单请求 需要将querystring转化为对象
    if (pathname === "/login" && req.method === "POST"){
       // 浏览器告知服务端提交的数据格式为表单数据 此时才可以使用querystring进行解析
      if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
        /**
         * 基于Node核心库querystring将表单数据转化为js对象
         * 第一个参数为要解析的查询字符串
         * 第二个参数为键值对连接的分隔符 默认为&
         * 第三个参数为键和值的分隔符 默认为=
         */
        const query = querystring.parse(body);
        console.log("POST解析后的js对象为", query);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(query));
      }
    }


    // 2. 如果是ajax请求 需要将json字符串转化为对象
    if (pathname === "/ajax" && req.method === "POST") {
      if (req.headers["content-type"] === "application/json") {
        res.setHeader('Content-Type','application/json')
        res.end(JSON.stringify(body));
      }
    }
  });
});



server.listen(3000);
