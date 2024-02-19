/****
 * 响应这里主要实现的一套正反都可以读取，还是通过代理模式实现：
 *   ctx.body = 'hello world'
    console.log(ctx.response.body); 

    ctx.response.body = '你好啊'
    console.log(ctx.body);
 */
const response = {

    _body:'',
    get body(){
        return this._body;
    },

    set body(newValue){
        this._body = newValue
    }
};

response
module.exports = response;