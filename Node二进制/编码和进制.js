/****
 * 
 * 常用的进制
 * + 10进制 decimal 
 * + 2进制 binary 0b开头代表二进制的数  0b11 => 3
 * + 8进制 octal 0o开头代表八进制的数 0o11 => 9
 * + 16进制 hexadecimal 0X开头代表十六进制的数 0x11=>17
 * 
 * 进制的互相转化
 * 1. 自己手写 基于栈实现
 * 2. 使用js语言提供的方法
 * 
 * 编码的最小单位是字节byte
 * 1字节 = 8个位bit 这个位里面存储的一定是一个二进制的数字 0或者1 这是可以肯定的 不管编码规范是UTF-8还是GBK 底层的位中存储的一定是二进制的数字
 * 常见的1字节代表一个字符
 * 在GBK编码中 2个字节代表一个汉字
 * 在utf-8编码中 3个字节代表一个汉字
 * 
 * 1个字节最多有8位 每一位假设都是1 那么1字节最大可以代表十进制的255 8进制的2396745 16进制的286331153
 * 
 */

/**
 * 将任意进制的数字转化为10进制
 * @param {*} number 
 */

function toDecimal(number,radix = 10){
    number = number.toString();
    let res = 0;
    for (let i = 0; i < number.length; i++) {
        const currentBitValue = number[i] * Math.pow(radix,i);
        res += currentBitValue;
    }
    return res;
}

/**
 * reduce版本
 * @param {*} number 
 * @param {*} radix 
 * @returns 
 */
function toDecimal1(number,radix = 10){
    number = number.toString().split("");
    return number.reduce((prev,curr,index)=>{
        return prev+=curr * Math.pow(radix,index);
    },0)

}
// console.log(toDecimal(11111111,2)) // 255
// console.log(toDecimal(11111111,8)) // 2396745
// console.log(toDecimal(11111111,16)) // 286331153


/****
 * 
 * 进制间的互相转化
 * 
 * 1. 任意进制转十进制 采用位值相加法
 * + 第一步 确定数字有几位
 * + 第二步 循环累加每一bit所代表的十进制的值 公式：value = 当前位的值 * 当前进制 ^ index
 * + 第三步 得出结果
 * js中取次方的函数：Math.pow(base,radix) 求base的radix次方
 * 或者使用es6新增的运算符：base ** radix也是相同的效果
 * 
 * 2. 十进制转任意进制 采用栈和不停取余法 最终将余数从栈顶依次拼接到栈底即可
 * 
 * 3. 任意进制转任意进制 
 * + 先将任意进制转为10进制
 * + 再将10进制转化任意进制
 * 
 * JS的方法：
 * 1. 任意进制转为10进制
 * Number.parseInt(any,radix)
 * 字面意思为parse 也就是先解析any这个值，然后基于用户传入的radix的值，将any当做radix进制的数字转化为十进制
 * + any的值必须是一个数字或者有效的数字字符串 比如0b11 0xff 0o77 '11px'
 * + 会自动进行截取有效数字
 * + 不传递radix或者传递0默认将数字当做十进制的值进行转化
 * + any值中的每一位必须都大于radix的值 你无法将一个99当做8进制去处理 此时会返回NaN
 * + radix 是 2-36 之间的整数 超出此范围返回NaN
 * 
 * 2. 将任意进制转任意进制
 * (15).toSting(radix) 将15当做十进制的值转化为任意radix的值
 * (0X16).toSting(radix) 将16当做16进制的值转化为任意radix的值
 */

/**
 * 
 * @param {*} dec 十进制的值
 * @param {*} radix 要转化的目标进制
 * 【2,5,5】
 */
function decToAnyRadix(dec,radix){
    const stack = [];
    let value = dec;
    while(true){
        let yushu = value % radix; // 7 7 3
        stack.push(yushu); // [7,7,3]
        if(yushu===value){
            break;
        }
        value = Math.floor(value / radix); // 31 3 
    }
    return stack.reverse().join("");
}

// console.log(decToAnyRadix(255,2)) // 1111111
// console.log(decToAnyRadix(255,8)) // 377 
// console.log(decToAnyRadix(255,16)) // 1515

console.log((255).toString(2)); // 11111111
console.log((255).toString(8)); // 377
console.log((255).toString(16)); // 0xff


/****
 * 
 * 常见的编码规范有：
 * + ASCII编码 
 * 一些常用的英文 数字和字母 进行了排号 最大可表示127 只会占用一个字节的大小 只能针对英文的国家使用
 * 每一个字节的第一位是0 
 * 
 * + GB2312 
 * 用两个字节来表示一个汉字 最多有27000多个字符
 * 
 * + GBK
 * 又拓展了一些汉字 4000
 * 
 * + GB18030 扩展的少数民族的汉字
 * 
 * + UTF-8
    在UTF-8编码中，普通字符占1个字节，一个中文字符占3个字节
 * + Unicode
 * 
 * 
 */




/*****
 * 
 * Buffer
 * 1. Buffer是一种数据结构，是专门用来存储文件读取结果等类似的二进制数据的
 * 2. 为了方便展示，Buffer以十六进制数据显示
 * 3. 一个英文单词的字节长度是1，一个中文的字节长度是3
 * 4. Buffer.from(str) 将字符串转化为Buffer
 * 5. Buffer.toString() 将Buffer转化为字符串
 * 
 * 默认情况下，当我们使用fs.readFile方法的时候如果不指定encoding编码格式，那么默认读取的结果是以Buffer表示的十六进制数据
 * 但是我们想要字符串啊，此时可以将Buffer转化为字符串
 * 
 * const fs = require('fs');
 * const res = fs.readFileSync('../a.txt');
 * console.log(res.toString());
 * 
 * 除此之外，假设我们指定了读取的编码格式为utf-8，但是文件的编码格式是GBK，此时就会出现乱码的情况，那么我们可以：
 * 基于iconv-lite第三方模块 将读取到的乱码格式的数据进行转码
 * 
 * const iconv = require('iconv-lite');
const fs = require('fs');
const content = fs.readFileSync('./1.txt'); // 读取到的以GBK编码的数据保存在Buffer中 注意此时不可以直接toString转化 因为只有读取一个utf-8编码的文件才可以直接调用toString转化
为字符串 但是这是gbk格式的 直接toString得到的是乱码的文本

// 因此需要基于iconv.decode对读取到的内容进行解码 然后以字符串方式输出
console.log(iconv.decode(content,'gbk'));
 */


/*****
 * 
 * base64编码
 * 1. 没有加密功能，只是编码层面的转化，因为加密就意味着解密 只有特定的对象可以解密 但是base64编码和解码是公开的 所以它不是加密算法
 * 2. base64的最大作用在于传输数据 也就是可以减少http请求 比如将小图片 icon转化为base64字符串 然后直接嵌入到网页中 这样就可以减少网页的http请求 还有cookie传输
 * 3. 为什么是base64 
 * base64的核心在于将一个字符从3*8位总计24位的二进制转化为4*6位的二进制
 * 假设每一个base64字节都为1，总计6位最大值也就是64，这就是base64的由来
 * 下面展示将一个字符"乖"转化为base64的过程：
 * 发现转换前使用utf-8编码只需要3个字节就可以表示，转化后反而变为4个字节，所以base64编码的问题在于会增加传输的字节空间的1/3
 * 所以不是所有内容都适合使用base64来进行编码
 * 4. 用途及方法
 * 
 */

const fs = require('fs');
const res = fs.readFileSync('./base64.text');

console.log(res); // <Buffer e4 b9 96>

// 1. 先将读取到的十六进制的buffer转化为2进制的数字
let binary = "";
binary += (0xe4).toString(2)
binary += (0xb9).toString(2) 
binary += (0x96).toString(2);

console.log(binary);  // 111001001011100110010110

// 2. 将3*8分隔为4*6
let base64 = "";
for (let i = 0; i < binary.length; i+=6) {
    base64 += binary.slice(i,i+6)
    base64 += " "
}

console.log(base64);  // 111001 001011 100110 010110

// 4. 将4*6的每一位转化为10进制的数字
let dec = "";
dec += parseInt('111001',2);
dec += " ";
dec += parseInt('001011',2);
dec += " ";
dec += parseInt('100110',2);
dec += " ";
dec += parseInt('010110',2);

console.log(dec);  // 57 11 38 22

// 5. 创建base64编码对照表
let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
str+=str.toLocaleLowerCase();
str+='0123456789';
str+="+/";

console.log(str);  // 57 11 38 22

// 6. 基于索引查到每一位的字符 然后拼接起来即可
let r = "";
r+=str[57]
r+=str[11]
r+=str[38]
r+=str[22]

console.log(r);  // 5LmW

