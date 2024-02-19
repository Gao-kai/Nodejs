### cookie localStorage sessionStorage
1. cookie（状态维持）
cookie会在每次网络请求的时候在附加请求头中发送给服务器，服务器根据本次请求的cookie返回不同的数据
cookie的最多可以存储4kb大小的数据
cookie可以设置过期时间  当过期之后会清空
cookie产生的方式有两种：
1. 服务器在返回的响应头Response Header中设置一个set-cookie：xxx的字段，浏览器拿到之后会解析并设置cookie为xxx
2. 客户端通过document.cookie属性设置，完整的格式是：document.cookie = `key=value;expires=&{(new Date()+10000).toGMTSting};domain=.example.com`;


2. localStorage
localStorage不会发送给服务器，仅仅存储在浏览器本地
localStorage是永久性存储，唯一的办法是手动删除
最多可以存储5MB的数据
有一系列进行存取的api接口


3. sessionStorage
sessionStorage不会发送给服务器，仅仅存储在浏览器本地
sessionStorage是会话型存储，当页面被关闭的时候删除
最多可以存储5MB的内容
有一系列可以存储的api接口
适合进行表单信息的存储，页面刷新的时候sessionStorage的内容不会丢失，只有页面关闭才会丢失

4. Storage类上共同的api
Storage.clear();
Storage.setItem(key.value);
Storage.getItme(key);
Storage.removeItme(key);

前端浏览器缓存
前端攻击方式及处理攻击方式
浏览器的JS引擎的事件循环机制以及消息队列
宏任务和微任务
从输入URL到页面展示，中间经过了什么
DNS查询的路径
页面渲染的原理
回流和重绘？如何减少？

HTTP状态码
HTTP请求的请求头字段
HTTP响应的响应头字段
HTTP2.0
### 三次握手四次挥手
### 回流重绘
### 19.三次握手四次挥手
### 网页从输入到页面显示
1. 输入一个url地址
2. 应用层DNS解析域名,浏览器查找域名的ip地址,查找过程如下:
浏览器缓存 – 浏览器会缓存DNS记录一段时间。 
系统缓存 – 如果在浏览器缓存里没有找到需要的记录，浏览器会做一个系统调用
如果又缓存直接返回主机ip
如果没有,那么进行DNS服务器从根域名服务器递归搜索查到主机ip
3. 浏览器与网站建立TCP连接

4. 浏览器发起HTTP请求
请求行 Method Request-URL HTTP-Version CRLF 请求方式 请求地址 HTTP协议版本 
请求头 Request Header
客户端向服务器附加的一些信息和客户端自己的一些信息
Cookie
Accept  application/json
User-Agent
Authorization
token
Content-Type text/html  application/json
请求正文
{
	
}
7. 服务器处理请求并响应请求返回html文件
状态码
200 ok
301 请求地址已经没了,永久重定向
302 请求地址已经没有了,临时重定向
304 Not Modified（未修改） 用客户端自己的缓存吧
400 客户端请求有错误
404 资源未找到
500 服务器问题 找后端

响应报头
cache-control: no-cache
content-type: application/json; charset=UTF-8
响应报文
返回的数据

服务器返回给浏览器的文本信息，通常HTML, CSS, JS, 图片等文件就放在这一部分。

9. 服务器返回相应文件

10. 前端拿到进行页面渲染
html数和css树 rander tree



### 浏览器优化
1. 能不请求就不请求 直接放在本地浏览器缓存中 涉及到强缓存和协商缓存
2. 如果一定要请求,那么就从进行DNS优化
3. 减少前端渲染时候的回流和重绘
先回流 后重绘
4. 图片懒加载
5. 子元素事件委托给父元素
6. 防抖节流
7. 减少css图片请求 css雪碧图
### 浏览器的事件循环和node.js的事件循环

### 宏任务和微任务
### 你知道浏览器都有哪些模块组成吗？（）
User Interface: UI组件包括地址栏，前进/后退按钮，书签菜单等。
Browser Engine: 在UI组件和渲染引擎间采取一些action.
Rendering engine : 负责显示请求的内容。例如，如果是HTML页面，它将解析HTML，CSS，并将解析的内容显示在屏幕上。
不同的浏览器使用不同的渲染引擎：
IE使用Trident
Firefox使用Gecko
Safari使用WebKit
Chrome和Opera（版本15开始）使用Blink。它是基于Webkit开发的。
4.    Networking: 负责网络调用，例如HTTP请求。在不同的平台有不同的实
5.    UI backend: 主要用来绘画基本的UI元素，例如下拉框，Windows等。这个UI后台暴露一些通用的接口，并不依赖平台的。
6.    JavaScript interpreter. 用来解析和运行JavaScript code。
7.    Data storage. 数据持久化的那一层。浏览器可能需要存储各种各样的数据，例如Cookie。浏览器也得支持我们常用的LocalStorage， IndexedDB，WebSQL以及FileSystem。
### 为什么将资源分发到不同的域名会更高效
### 11.常见的HTTP状态码有哪些？
200 ok
301 请求地址已经没了,永久重定向
302 请求地址已经没有了,临时重定向
304 Not Modified（未修改） 用客户端自己的缓存吧
400 客户端请求有错误
404 资源未找到
500 服务器问题 找后端
### 9.前端性能优化都有什么思路？都有哪些方案去优化？
1. 能不请求就不请求 直接放在本地浏览器缓存中 涉及到强缓存和协商缓存
2. 如果一定要请求,那么就从进行DNS优化
3. 减少前端渲染时候的回流和重绘
先回流 后重绘
4. 图片懒加载
5. 子元素事件委托给父元素
6. 防抖节流
7. 减少css图片请求 css雪碧图