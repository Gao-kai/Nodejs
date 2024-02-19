/****
 * 一、cookie、localStorage和sessionStorage的区别
 * 
 * 1. localStorage和sessionStorage是本地存储，发送http请求不会携带；而cookie在发送请求时会携带
 * 2. localStorage永久存储除非用户手动清除，sessionStorage临时存储，用户关闭标签页面就销毁，刷新页面不会销毁
 * 3. localStorage和sessionStorage存储空间为5MB;单个cookie可以携带的数据大小为4kb
 * 4. localStorage和sessionStorage不能跨域
 * 
 * 二、http无状态-cookie和session解决方案
 * 
 * 1. 客户端请求服务端，携带登录信息
 * 2. 服务端校验之后，返回一个cookie给客户端，标识这个用户信息
 * 3. 由于cookie在服务端被设置过，但是客户端也可以进行修改，所以cookie不安全，因此cookie中不应该存储敏感信息
 * 4. 修改后的cookie会随着请求自动发送到服务端
 * 5. 服务端校验cookie中用户信息，可见cookie是存储在客户端的
 * 
 * 以上这种基于cookie来让http产生状态的方案是不安全的，所以就有了session方案，也就是将用户信息存储在服务端
 * 1. 客户端请求，携带登录信息
 * 2. 服务端校验通过，产生一个用户唯一的sessionId
 * 3. 将sessionId包装在cookie中返回给客户端
 * 4. 客户端下次再访问，服务端只需要校验cookie中携带的sessionId
 * 5. sessionId校验通过，服务端就去用户数据库中找到用户的数据，进行操作crud
 * 6. session方案是将用户信息存储在服务端的，相对于cookie更加安全
 * 7. 但是session其实就是一个服务端上存储信息的内存空间，每次重启服务就会丢失，所以我们需要将session存储在redis数据库，也就是缓存数据库，重启服务不丢失，也可以用mongoDB存储
 * 8. session还存在一个多平台共享状态的问题，需要服务器集群解决
 * 
 * 当前比较流行的方案是jwt json web token，jwt不存储在服务端
 * 
 * 
 * 
 * 
 * 
 * 
 */