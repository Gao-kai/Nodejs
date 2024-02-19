/****
 * 
 * nrm 专门用来管理npm源的工具
 * 
 * npm i nrm -g 
 * 安装完成之后会输出下面一句话：
 * C:\Program Files\nodejs\nrm -> C:\Program Files\nodejs\node_modules\nrm\cli.js
 * 意思就是将安装的nrm模块放到nodejs目录下 当做一个快捷键
 * 后续执行nrm的时候会连接到C:\Program Files\nodejs\node_modules\nrm\cli.js目录下执行cli.js
 * 
 * npm info package name
 * npm link 创建一个包 可以直接在本地终端像使用全局命令一样使用bin中的命令
 * 1. npm init
 * 2. package。json中创建bin的配置
 * 3. #! /usr/bin/env node 告诉执行的时候基于node执行
 * 4. npm link 临时将这个包拷贝到全局c盘的node modules中
 * 5. 调用bin的命令 执行全局的包 全局的包的链接指向本地bin下面的js可执行文件 基于node执行
 * 
 * 
 * npm i package -D / --save-dev 开发依赖
 * npm i package -S / --save 项目依赖
 * peer 安装
 * 
 * major 破坏更新
 * minor 功能更新
 * path bug
 * 
 * ^2.0.0 限制大版本号不能大于3不能小于2
 * ~2.2.0 限制中间版本号 不能是2.3.x  只能是2.2.xx
 * >=
 * <=
 * 1.0.0-2.0.0
 * alpha
 * beta
 * rc  
 * 
 * npm run 命令
 *  1. 简化 比如 run dev ===》 vue-cli-service dev
 *  2. 项目中执行本地安装的包 项目中安装了一个mime包 但是没办法直接在全局用 就配置到scripts中
 *  npm run mime：mime
 *  mime -- a.js 打印出对应的信息  
 * 
 * 流程
 * npm run xxx
 * 此时会将./node_modules/.bin/目录添加到执行环境也就是node的PATH变量中
 * 后续等于是在全局中执行xxx命令 并且基于--xxx进行传递参数
 * 好处就是可以将局部安装的模块在全局执行
 * 
 * 证明：
 * 当运行npm run env的时候此时打印的环境变量PATH中就有：C:\Users\克林辣舞\Desktop\NodeJS\npmpackage\node_modules\.bin;
 * 证明run命令确实可以将./node_modules/.bin/目录添加到执行环境也就是node的PATH变量中
 * 从而起到本地的包可以当做全局包一样执行的效果
 * 
 * npx也是一样的作用
 * npx package 也等于将./node_modules/.bin/目录添加到执行环境也就是node的PATH变量中
 * 但是它会先安装最新的package版本 
 * 然后将./node_modules/.bin/目录添加到执行环境
 * 然后把这个包当做全局的包一样执行
 * 执行完成之后删除
 * 
 */