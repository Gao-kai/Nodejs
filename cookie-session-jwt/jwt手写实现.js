const crypto = require("crypto");
const jwt = {
    // 将base64url反转化为base64
    base64urlUnescape(base64){
        base64 += new Array(5 - base64.length % 4).join("=");
        return base64.replace(/\-/g,'+').replace(/_/g,'/');
    },
    decode(token,secret){
        const [header,content,signature] = token.split('.')
        // 生成一个新签名
        let newSignature = this.sign([header,content].join('.'),secret)
        console.log({newSignature,signature});
        // 前后签名对比
        if(signature === newSignature){
            // 将base64url反转化为base64
           let res = this.base64urlUnescape(content);
        //    将base64进一步转化为字符串
           return Buffer.from(res,'base64').toString();
        }else{
            throw new Error('TOKEN 被修改')
        }
    },
    /**
     * 生成一个jwt token
     * @param {*} payload 是jwt的一部分 也就是最核心的要加密的用户信息
     * @param {*} secret 秘钥
     */
    encode(payload,secret){

        // jwt组成部分1：header 是固定的
        let header = this.toBase64({
            typ:"JWT",
            alg:"HS256"
        })
        console.log('jwt组成部分1: header加密结果',header);

        // jwt组成部分2：payload
        let content = this.toBase64(payload)
        console.log('jwt组成部分2：payload加密结果',content);


        // jwt组成部分3：加盐加密签名
        let signature = this.sign([header,content].join('.'),secret)
        console.log('jwt组成部分3: 加盐加密签名结果',signature);

        // 结合
        let token =  [header,content,signature].join('.')
        console.log('token结果',token);
        return token;

    },
    sign(content,secret){
       let signature =  crypto.createHmac('sha256',secret).update(content).digest('base64');
       return this.toBase64URL(signature)
    },

    toBase64(content){
        if(typeof content === 'object'){
            content = JSON.stringify(content)
        }
        return this.toBase64URL(Buffer.from(content).toString('base64'))
    },
    /**
     * 将base64字符串转化为toBase64URL 因为有的字符 +=/在传输中会乱码
     * 将+号变为-
     * 将/变为_
     * 将=号变为空字符串
     * 
     * @param {*} base64 
     * @returns 
     */
    toBase64URL(base64){
        return base64.replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")
    }
}

jwt.encode({username:'admin',password:'123456'},'nodejs')
jwt.decode('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjM0NTYifQ.sfxuXX51riMXTn1TqwVapSbOOJeKbemI_z1YJ67soiQ','nodejs')
module.exports = jwt;

// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
// eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjM0NTYifQ
// sfxuXX51riMXTn1TqwVapSbOOJeKbemI_z1YJ67soiQ