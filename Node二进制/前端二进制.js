/*****
 * 
 * 前端很少操作二进制，但是有几个场景还是会用到二进制：
 * 1. 文件类型 Blob对象 Binary large object 
 * 2. 文件上传得到的File对象继承子Blob类
 * 
 * 主要两个使用场景：
 * 1. 文件下载
 * 将一个字符串包装成为Blob对象，然后将blob对象转化为一个URL，最后将url路径赋值给a标签的href属性 实现下载
 *      const html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <h1>hello</h1>
            </body>
            </html>
        `;
        const blob = new Blob([html],{
            type:"text/html"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('download','demo.html');
        a.innerHTML = "点击下载"
        a.href = url;
        document.body.appendChild(a);
        URL.revokeObjectURL()

 * 2. 文件预览
 * 将本地选择的文件也就是file对象，基于fileReader进行读取，当onlaod事件触发之后，说明读取完成
 * 然后将读取到的结果赋值给img元素进行预览
 * 其实也可以将读取到的file对象直接调用createObjectUrl转化为一个链接  然后进行img的赋值都可以的
 * 
 * 
 *  input.onchange = function(e){
        // 获取到文件对象 继承自Blob对象
        const file = e.target.files[0];
        if(file){
            // 只有文件对象还不行 需要读取出内容也就是二进制 然后将二进制转为前端可以用的utl
            const fileReader = new FileReader();
            // 读取为base64URL
            fileReader.readAsDataURL(file);
            // 读取完成之后结果存在fileReader.result属性上
            fileReader.onload = function(){
                const img = new Image();
                img.src = fileReader.result;
                document.body.appendChild(img);
            }
        }
    }
 */


