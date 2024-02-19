#! /usr/bin/env node

/****
 * 作用就是解析用户参数
 * 并将解析后的参数传递给程序入口文件
 */
const program = require('commander');
const packageJson = require('../package.json');
const HttpServer = require('../src/server')

/*****
 * 定义控制台输入命令gk-start --help的时候一些默认配置
 */
program.name('gk自己写的http-server'); // 程序名称
program.version(packageJson.version); // 版本
program.usage('请按照如下操作输入') // --help之后控制台的帮助信息提示
program.description ('这是一个可以为你快速启动http本地服务的命令行工具') // 描述

/*****
 * 用户自定义的配置对象
 */
const config = {
    port:{
        option:"-p --port <value>",
        description:"请输入端口号",
        default:3000,
        usage:"gk-start --port 3000"
    },
    host:{
        option:"-h --host <value>",
        description:"请输入主机名",
        default:"localhost",
        usage:"gk-start --host 127.0.0.1"
    },
    directory:{
        option:"-d --directory <value>",
        description:"请输入工作目录",
        default:process.cwd(),
        usage:"gk-start --directory D:"
    }
}

/*****
 * 注入option配置 包含选项 描述 以及默认值
 */
Object.values(config).forEach(item=>{
    program.option(item.option,item.description,item.default)
})

/*****
 * 监听--help输入事件 触发回调 可以在回调里面做控制台打印输出
 */
program.on('--help',()=>{
    console.log('\r\n 下面是使用案例：');
    Object.values(config).forEach(item=>{
        if(item.usage){
            console.log('  ' + item.usage);
        }
    })
})

/*****
 * 必备的解析参数过程 默认从argv[2]开始解析 返回值是一个对象 里面包含了program的所有信息
 */
const parse = program.parse()
// console.log('parse',parse);

/*****
 * 获取用户传入参数和默认参数合并后的最终参数
 */
const options = program.opts();
console.log('options',options);


/*****
 * 基于参数实现http-server
 */
const server = new HttpServer(options);
server.start(()=>{
    console.log('http服务启动over！！！');
});