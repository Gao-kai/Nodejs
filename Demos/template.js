const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

// 使用ejs库实现的模板引擎
// ejs.renderFile(path.resolve(__dirname,'../index.html'),{name:"lilei",age:18,arr:[1,2,3]},(err,data)=>{
//     console.log(data)
// })

/* 
渲染结果：
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    lilei 18
    <div>1</div>

    <div>2</div>

    <div>3</div>
</body>
</html> 
*/

/****
 * 
 * 1. 去掉<%和%>
 * 2. 将{{}}内的变量替换为值
 * 3. 字符串拼接
 * 4. 拼接之后调用new Function生成函数
 * 5. 函数执行时强行绑定基于with的作用域
 * 6. 函数执行的结果就是生成后的模板
 * 
 */
function renderFile(filePath,obj,callback){
    fs.readFile(filePath,'utf-8',(err,html)=>{
        if(err){
            callback(err,data)
        }
        /****
         * 1. 将{{}}内的变量替换为值
         * replace方法的第一个参数是正则，第二个参数为函数时，函数从第二个参数开始依次为第1个、第2个括号匹配到的子串
         * 这里我们要匹配双大括号{{}}中间的内容 也就是([^}]+)小括号内匹配到的内容
         * 小括号内表示所有不是}的字符，一到多个的组合 都可以被匹配到
         * 每匹配到一次 就执行一次函数
         * match就是匹配到的原字符串中匹配到的部分 {{name}}
         * args[0]就是一个小括号匹配到的东西 name
         * 函数的返回值将会被当做替换的值
         */
        html = html.replace(/\{\{([^}]+)\}\}/g,function(match,...args){
            const key = args[0].trim();
            return '${' +key+ '}'
        })

        // 3. 字符串拼接
        let head = `let str = '';\r\nwith(obj){\r\n`;
        head = head + 'str+=`';

        // 2. 去掉<%和%>
        html = html.replace(/\<\%([^%]+)\%\>/g,function(match,...args){
            return '`\r\n' + args[0] + '\r\nstr+=`\r\n'
        })

        let tail = '`}\r\n return str;'

        // 4. 拼接之后调用new Function生成函数
        const fn = new Function('obj',head + html + tail);
        // 5. 函数执行的结果就是生成后的模板
        const template = fn(obj);

        callback(err,template);
    })
}

const filePath = path.resolve(__dirname,'../index.html');
const obj = {name:"lilei",age:18,arr:[1,2,3]};

renderFile(filePath,obj,(err,data)=>{
    console.log('data',data);
});

