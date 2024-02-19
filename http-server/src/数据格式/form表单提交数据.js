/*****
 * 浏览器向服务端发送请求一般有两种方法：
 * 1. ajax请求 会跨域 但是页面无感知
 * 2. 基于form标签的action等属性的表单提交 
 *       + 不会跨域 但是页面会刷新 
 *       + 不安全 任何人都可以访问我们的服务端
 *       + 可能会造成csrf攻击 解决方案可以是隐藏域加后端返回的唯一token实现
 */


/****
 * 
 * core：表单提交数据的三种格式
 * 
 * 一、如果使用POST传递参数：
 * 
 * 表单提交数据时可以指定提交的数据传输格式：
 * 1. 表单数据格式
 * enctype="application/x-www-form-urlencoded"  
 * 传输的数据格式为为：username=111&password=222
 * 如果不写enctype属性 那么默认请求头的content-type的值就是：application/x-www-form-urlencoded
 * 
 * 
 * 2. 文件类型 多用文件上传
 * enctype="multipart/form-data"
 * 传输的数据格式为：
    ------WebKitFormBoundary0KCJCEBtyBPIlz76
    Content-Disposition: form-data; name="iphone"

    222
    ------WebKitFormBoundary0KCJCEBtyBPIlz76
    Content-Disposition: form-data; name="qq"

    333
    ------WebKitFormBoundary0KCJCEBtyBPIlz76--
 * 
 * 
 * 3. 纯文本
 * enctype="text/plain"
 * 传输的数据格式为：
 *  wechat=333
    douyin=666
 *

    二、如果采用GET提交
    那么不管采用的是那种格式的传输格式，都会附加在请求path的后面以查询字符串参数的形式发送给后端：
    
    http://localhost:3000/login?username=111&password=22
    http://localhost:3000/login?iphone=33&qq=44
    http://localhost:3000/login?wechat=55&douyin=66

    此时req对象监听不到data事件和end事件，只能从req的url属性中读取到值
    然后进行解析

 */
