/****
 * 异步串行删除
 *  1. 递归还是得有
 *  2. 通过next将异步删除的时间点连接起来
 *  3. 一个删除完成，回调直接执行next 将删除下一个的逻辑封装在next中
 *  4. next函数的功能就是每次执行 从目录列表中取出一个进行删除
 * 
 * 
 */
const fs = require('fs');
const path =require('path');

function removeDirAsyncSerial(dirName,callback){
    fs.stat(dirName,(err,stat)=>{
        if(stat.isDirectory()){
            // 删除文件夹 先获取当前目录的所有文件夹和文件
            fs.readdir(dirName,(err,childrenDirs)=>{
               
                // 父子路径进行拼接 并返回新数组 
                const dirs = childrenDirs.map(childDir=>path.join(dirName,childDir))
                // 取值递增器
                let index = 0;

                function next(){
                    // 子目录删除完了 最后删除父目录 
                    if(index === dirs.length){
                        return fs.rmdir(dirName,callback)
                    }
                    // 每一轮从第0个开始取 然后删除子目录
                    const currPath = dirs[index];
                    index++;
                    // 只有第一个删除完成了之后才会执行next index++ 才会删除第二个 串起来
                    removeDirAsyncSerial(currPath,next)
                }

                next();
            })
        }else{
            fs.unlink(dirName,callback)
        }
    })    

}


removeDirAsyncSerial('q',(err)=>{
    if(err){
        console.log('删除失败',err);
        return;
    }
    console.log('删除成功');
})