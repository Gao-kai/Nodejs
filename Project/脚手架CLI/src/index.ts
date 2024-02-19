#! /usr/bin/env node

console.log('⭐⭐⭐⭐ 脚手架Fast-Cli开始拉取模板 ⭐⭐⭐⭐ ');

import {Command, program} from 'commander'
import chalk from 'chalk'

// tsconfig.json中规定了生成代码的模板标准 "module": "ESNext",
// 所以这里如果写require语法 由于没有webpack等构建工具的转化
// 并不会转成es语法 而是原封不动拷贝过去
// 当node在执行bin下面的index.js的时候 就会读取package下的module字段
// 该字段的值是mudule node就会将当前文件当做esmodule模块来执行
// 执行的过程中缺少require语法支持就会报错
// 所以这里需要做一系列工作来将node中的api使用es的import来导入
// 以后会慢慢趋近这种node的esm写法
import { createRequire } from 'module';
import {join,dirname} from 'path';
import { fileURLToPath } from 'url';


/****
 * import.meta是什么？
 * 
 * import.meta是一个给 JavaScript 模块暴露特定上下文的元数据属性的对象。它包含了这个模块的信息，比如说这个模块的 URL。
 * 
 * import.meta对象由一个关键字"import",一个点符号和一个meta属性名组成。通常情况下"import."是作为一个属性访问的上下文，但是在这里"import"不是一个真正的对象。
 * 
 * import.meta对象是由 ECMAScript 实现的，它带有一个null的原型对象。这个对象可以扩展，并且它的属性都是可写，可配置和可枚举的。
 * 
 * import.meta返回一个带有url属性的对象，指明模块的基本 URL。也可以是外部脚本的 URL，还可以是内联脚本所属文档的 URL。
 * 
 * 注意，url 也可能包含参数或者哈希（比如后缀?或#）
 * 
 *  {
 *    url: 'file:///C:/Users/%E5%85%8B%E6%9E%97%E8%BE%A3%E8%88%9E/Desktop/cli/bin/index.js'
 *  }
 */

// 获取当前node执行的bin目录下的index.js文件的file协议路径
const fileUrl = import.meta.url;

// 将file协议路径转化为node方法可用的path绝对路径
const __filename = fileURLToPath(fileUrl)

// 获取到path绝对路径的目录的绝对路径
const __dirname = dirname(__filename)

// 创建一个基于bin/index.js执行时的路径为基础的require方法
const require = createRequire(fileUrl)

// 基于require方法获取package.json中信息
const packageJson = require(join(__dirname,'../package.json'));

// console.log({
//     fileUrl,
//     __filename,
//     __dirname,
//     packageJsonPath:join(__dirname,'../package.json')
// });


/*
 * 
 * 第一步：解析用户传入的终端参数
 * 
 */

// 终端命令执行--help之后的基本信息
program.name(packageJson.name)
program.description('This is a good CLI by GK!')
program.version(packageJson.name + '@' + packageJson.version);
program.usage("<command> [option]"); // <command>表示必填命令 [option]表示可选选项
program.helpOption('-e, --help', `Read More Information:https://www.npmjs.com/package/${packageJson.name}`);

// console.log(program.parse(process.argv).args);
/****
 * 设置command命令有两种方式：
 * 1. command('命令名称 <必选命令参数> [可选命令参数]')一次指定执行当前命令的多个参数
 * 2. argument('<必选命令参数>',描述) 一次指定当前命令的一个参数
 *    argument('[可选命令参数]',描述) 一次指定当前命令的一个参数
 */
program
    .command('create <project-name>')
    .description('创建一个全新的Vue2.0项目')
    .option("-f,--force","覆盖当前目标文件夹")
    .action(async (projectName,options)=>{
        // console.log({
        //     projectName, // 对应命令声明的参数
        //     options, // 对应执行命令时传入选项参数
        // });

        // import()语法返回一个Promise实例 成功之后resolve一个{default:value}对象的默认导出
        const module = await import('./commands/create.js')
        module.default(projectName,options);
    })

/****
 * program.action的参数解析
 * 1. 定义program.command命令的时候 假设定义了三个非必选的 一个必选的
 *  最后在action中就会按照顺序 前面三个参数是非必选的 第四个是必选的 后面两个参数
 *  是固定的
 *  第一个固定的执行该命令时传递的选项 以对象保存 比如-f 那么{force:true}
 *  第二个固定的就是该命令对象自己 也是对象 也就是command对象上的诸多方法
 * 
 * 2. 如果没有命令参数 那么第一个参数就是选项参数 后面就是command自己
 * 所以我们可以给命令一个默认可选的value
 */
program.command('config [value]')
    .description("修改 查看 删除你的配置")
    .option('-g,--get <key>','获取key对应的值')
    .option('-s,--set <key> <val>','设置key对应的值为val')
    .option('-d,--del <key>','删除key对应的值')
    .action(async (value,options)=>{
        const module = await import('./commands/config.js')
        module.default(value,options);
        
    })


// 在help提示的末尾添加额外的帮助信息
program.addHelpText(
    'after',
    `\n\r Run ${chalk.blueBright('fast-cli <command> --help')} for detailed usage of given command`
);

// 会自动将用户传入的命令行参数解析
program.parse(process.argv);

