const http = require("http");
const queryString = require("querystring");
const crypto = require("crypto");
/****
 *
 * signCookie 给某个cookie的值进行签名
 * crypto.createHmac方法的第一个值是加密算法，第二个值是秘钥secret
 * update方法的参数是要加密的内容
 * digest方法的参数是要输出的摘要格式
 *
 */
function signCookie(value) {
  const secret = "nodejs";
  let base64Sign = crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64");

  // 进一步将base64字符串转化为base64URL
  return base64Sign.replaceAll(/\/|\=|\+/g, "");
}

const server = http.createServer((req, res) => {
  // 封装的获取cookie的方法
  req.getCookie = function (key, options) {
    const cookie = queryString.parse(req.headers.cookie, "; ", "=");
    if (cookie) {
      // 说明读取cookie的时候需要校验
      if (options?.signed) {
        let [value, sign] = cookie[key].split(".");
        let _sign = signCookie(value);

        console.log({ sign, _sign });

        // 签名对比是否一致 如果浏览器手动修改了cookie 
        if (sign !== _sign) {
          return "warning! cookie is edited!!!";
        }
      }

      return JSON.stringify(cookie[key]);
    }

    return "error key in cookie";
  };

  // 封装的设置cookie的方法
  let cookieList = [];
  res.setCookie = function (key, value, options) {
    let optionList = [];
    if (options.domain) {
      optionList.push(`domain=${options.domain}`);
    }

    if (options.path) {
      optionList.push(`path=${options.path}`);
    }

    if (options.expires) {
      optionList.push(`expires=${options.expires}`);
    }

    if (options.maxAge) {
      optionList.push(`max-age=${options.maxAge}`);
    }

    if (options.httpOnly) {
      optionList.push(`httpOnly=${options.httpOnly}`);
    }

    // 为cookie设置签名
    if (options.signed) {
      value = value + "." + signCookie(value);
    }

    // ["httpOnly=true;","max-age=18"]

    cookieList.push(`${key}=${value};${optionList.join("; ")}`);
    res.setHeader("Set-Cookie", cookieList);
  };

  const path = req.url;
  if (path === "/read") {
    // parse方法第一个是值，第二个是字段链接符号默认是&，第三个是key-value连接符，默认是=
    // "name=lilei&age=18"将会被解析为 {name:lilei,age:18}
    // const cookie = queryString.parse(req.headers.cookie, "; ", "=");

    res.end(req.getCookie("name", { signed: true }));
  } else if (path === "/write") {
    /****
     * res.setHeader要涉及多个cookie键值对，不能这样写，这样写会一直被覆盖
     *
     * res.setHeader("Set-Cookie", "name=lilei");
     * res.setHeader("Set-Cookie", "age=18");
     * res.setHeader("Set-Cookie", "uid=10086");
     *
     * 而应该像下面这样写：
     * res.setHeader("Set-Cookie", ["name=lilei", "age=18","uid=10086"])
     *
     * 除此之外，cookie还有很多属性可以设置：
     * 1. domain设置cookie所属的域名 一般会设置父域名和子域名
     * 设置一个cookie的domain域名的值为 .baidu.com 那么下列子域名都可以访问.baidu.com域设置的cookie：
     * wenku.baidu.com
     * music.baidu.com
     * map.baidu.com
     *
     * domain默认就是当前域名，可以有效减少cookie的传输大小
     * 子域名可以访问父域名设置的cookie 比如.baidu.com设置的cookie任意xxx.baidu.com都可以访问
     * 但是父域名不能访问子域名设置的cookie 比如 wenku.baidu.com设置的baidu.com就不能访问了
     *
     * 但是假设设置了.wenku.baidu.com 那么就只能wenku.baidu.com访问，其他域名就不可以了
     *
     * 2. path 针对某个域名的某个路径设置 默认为/ 表示任意路径 很少修改
     * 3. expries cookie过期时间 是一个绝对时间 过了这个时间就过期
     * 4. max-age cookie过期相对时间 过多少秒之后cookie就过期
     * 5. httpOnly 是否允许客户端只读 但不是一定安全的
     *  + 虽然代码层面无法修改 但是可以手动无任何限制修改 并附带请求发送给服务端 所以也是不安全的
     *  + postman等工具可以模拟请求 也可以手动配置cookie
     *  + 就算cookie使用加盐进行了加密算法 cookie也一样不能存储明文信息
     *
     * 如何保障cookie的安全性呢？
     * 服务端给浏览器设置cookie的时候，可以增加一个签名
     * 这个签名是基于数据内容创建的一个唯一的签名 下次浏览器发送请求时会携带cookie
     * 服务器只需要去对比用户和签名是否匹配 就可以知道用户身份了
     *
     * 加盐算法：基于内容和秘钥计算出一个签名 不能反向破解 这点和MD5不一样
     * 前提：相同的秘钥加上相同的结果每次签名的结果是相同的，只要稍微改下内容签名就会产生很大变化
     *
     */
    const expires = new Date(Date.now() + 60 * 1000).toGMTString();

    /* 原生设置cookie的方法 */
    /*    res.setHeader("Set-Cookie", [
      `name=lilei; domain=.gk.com; path=/; expires=${expires}`,
      "age=18; domain=.b.gk.com; max-age=120",
      "uid=10086; domain=music.b.gk.com; httpOnly=true",
    ]); */

    /* 使用封装的设置cookie的方法 更加清晰更加语义化 */
    res.setCookie("name", "lilei", {
      domain: ".gk.com",
      path: "/",
      expires: expires,
      httpOnly: true,
      signed: true,
    });

    res.end("cookie write success");
  } else {
    res.end("not found");
  }
});

server.listen(3000, () => {
  console.log("HTTP Server Start Success!(#^.^#)");
});
