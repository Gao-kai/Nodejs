const path = require('path');
const fs = require('fs');

/**
 * Node中涉及文件夹的几个核心API
 * 
 * fs.mkdir 创建文件夹
 * fs.stat 获取文件状态对象 返回值中有属性
 *  + stat.isFile 判断是否为文件
 *  + stat.isDirectory 判断是否为文件夹
 * 
 * fs.unlink 删除文件
 * fs.rmdir 删除文件夹
 * 
 * fs.readdir 读取文件夹子元素 返回值为一个数组
 * 
 * 同步删除主打的就是深度优先 先找到最底层的删除 依次向上删除
 */
function removeDirSync(dirName){
    // 首先判断要删除的是文件还是文件夹
    const fileStat = fs.statSync(dirName);
    if(fileStat.isFile()){
        // 是文件直接删除
        fs.unlinkSync(dirName);
    }else{
        // 是文件夹开始读取其子目录
        const childrenDirs = fs.readdirSync(dirName);
        
        for (let i = 0; i < childrenDirs.length; i++) {
            const temp = childrenDirs[i];
            // 做一个拼接 path.join 父 + 子
            const childDirName = path.join(dirName,temp);
            // 深度优先 递归的去删除 先找到最底层的删除 依次向上弹栈
            removeDirSync(childDirName)
        }

        // 所有子目录删除完了 最后删除自己
        fs.rmdirSync(dirName);
        console.log(dirName)
    }
}

removeDirSync('a')