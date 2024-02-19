/**
 * node 执行js程序的时候可以传递参数 参数会被process.argv所接收
 * 那么该如何解析参数了 比如webpack中的 --mode development --port 3000
 * 解析为：{mode:'development',port:3000}
 * 可以自己写方法进行解析 当然更好的借助于commander 一个完整的Nodejs命令行解决方案
 */
const program= require('commander');

// 定义选项
program
.name('node')
.usage('一个程序')
.version('0.0.1')
.option('-m,--mode <value>','设置当前模式')
.option('-p,--port <value>','设置端口')
.command('create app')
.action(()=>{
    console.log('第一个命令 你需要创建一个App')
})

// 解析
program.parse(process.argv);
// console.log(line)

// 获取解析后的对象
const options = program.opts();
 
// 打印
console.log('options',options)