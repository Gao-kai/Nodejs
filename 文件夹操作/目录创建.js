/****
 * 
 * Node中的fs模块除了可以操作文件，还可以操作文件夹，下面是常见的操作文件夹的方法：
 * 1. fs.mkdirSync(path) 创建一个目录
 *   + 创建文件夹时必须保证父路径是存在的 比如只能先创建a然后在a下面创建b 不能一下子就创建a以及a下面的b
 *   
 *   + 创建文件夹时可以是a/b 也可以是a\\b 都会被path模块进行解析
 *      
 * 2. 需求：规定一个路径诸如a/b/c/d/e/f 要求一次性创建所有文件夹
 *  + 同步创建for循环
 *  + 异步创建 
 *      + next异步回调 + 递归
 *      + async await + for循环
 * 
 */

const fs = require("fs");
const promiseFs = require("fs").promises;


/**
 * 同步创建多个目录
 * @param {*} paths 
 */
function mkdirByPathsSync(paths){
    const pathList = paths.split("/");
    for (let i = 0; i < pathList.length; i++) {
        const currPath = pathList.slice(0,i+1).join("/");
        console.log(currPath);
        // 如果已经存在 不再创建
        if(!fs.existsSync(currPath)){
            fs.mkdirSync(currPath);
        }
    }
}

mkdirByPathsSync('a/b/c/d/e/f')


/**
 * 异步创建多个目录 基于回调
 * 
 */
function mkdirByPathsAsync1(paths,callback){
    const pathList = paths.split('/');
    let index = 0;
    function next(err){
        // 如果报错就直接返回
        if(err){
            return callback(err);
        }
        // 中止条件
        if(index >= pathList.length){
            return callback();
        }

        const currPath = pathList.slice(0,index+1).join('/');
        index++;
        
        /**
         * fs.access API 用于替代fs.exist 异步检测是否存在文件夹的方法
         * 如果报错 说明文件不可访问也就是不存在 此时才应该去创建新目录
         *  如果不报错 说明文件已经存在 执行下一个next
         */
        fs.access(currPath,(err)=>{
            if(err){
                fs.mkdir(currPath,next)
            }else{
                next();
            }
        })
    }

    next();
}
mkdirByPathsAsync1('q/w/e/r',(err)=>{
    console.error(err);
})

/**
 * 异步创建多个目录 基于promise + async + await
 * 
 */
async function mkdirByPathsAsync2(paths,callback){
    const pathList = paths.split("/");
    for (let i = 0; i < pathList.length; i++) {
        const currPath = pathList.slice(0,i+1).join("/");
        console.log(currPath);

        try {
            await promiseFs.access(currPath)
        } catch (error) {
            await promiseFs.mkdir(currPath)
        }
    }
}

mkdirByPathsAsync2('z/x/c/v')