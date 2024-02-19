/**
 *
 * 串行异步并发删除
 * 1. 类似promise/all的原理
 * 
 * 0. 先判断文件夹是否为文件夹
 * 1. 读取文件夹的子目录 假设a的子目录是[b,c] 开一个计数器0
 *      b删除完成 done +1
 *      c删除完成 done +1 = 2 符合条件 直接done
 *      最后的done就是最外层的callback 最终执行用户回调
 * 2. 不等待 直接并发读取b和c的子目录
 * 3. 假设b的子目录是【d,e】 开一个计数器0
 *          d子目录为空 直接删除 触发callback其实就是done 此时计数器为1
 *          e子目录为空 同上 此时计数器为2 满足条件删除目录b 触发上一层的done
 *          
 */
const fs = require('fs');
const path =require('path');


function removeDirAsyncParallel(dirName, callback) {
  fs.stat(dirName, (err, stat) => {
    if (stat.isDirectory()) {
      // 删除文件夹 先获取当前目录的所有文件夹和文件
      fs.readdir(dirName, (err, childrenDirs) => {
        // 父子路径进行拼接 并返回新数组
        const dirs = childrenDirs.map((childDir) =>
          path.join(dirName, childDir)
        );

        // 如果当前子目录为空 直接将父目录自己删除
        if(dirs.length===0){
            return fs.rmdir(dirName,callback);
        }

        // 每一层都有一个计数器
        let times = 0;
        function done(){
            times++;
            if(times === dirs.length){
                return fs.rmdir(dirName,callback);
            }
        }

        // 并发删除
        for (let i = 0; i < dirs.length; i++) {
            // 获取要删除的子路径
            const childDir = dirs[i];

            removeDirAsyncParallel(childDir,done)
            
        }
      });
    } else {
      fs.unlink(dirName, callback);
    }
  });
}

removeDirAsyncParallel("z", (err) => {
  if (err) {
    console.log("删除失败", err);
    return;
  }
  console.log("删除成功");
});
