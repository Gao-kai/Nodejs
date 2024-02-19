const url = require('url');

const request = {
    /****
     * 基于属性存取器获取 ctx.request.url的值
     * 
     * getter函数中this就是ctx.request
     * ctx.request上本就有req属性指向req对象
     * 从ctx.request.req.url上获取即可
     */
   get url(){
    return this.req.url;
   },


   /****
    * 获取请求路径path
    */
   get path(){
    return url.parse(this.req.url).path;
   },


    /****
    * 获取查询参数query
    */
   get query(){
    return url.parse(this.req.url,true).query;
   },

};


module.exports = request;