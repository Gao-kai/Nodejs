const path = require('path');
const fs = require('fs');

// 读取文件状态
// fs.stat('./demo.txt',(err,info)=>{
//     if(!err){
//         console.log('文件状态为',info)
//     }
// })

// 文件描述符
// fs.open('./demo.txt',(err,fd)=>{
//     if(!err){
//         console.log('文件描述符为',fd)
//     }

//     // 基于文件描述符获取文件状态
//     fs.fstat(fd,(err,info)=>{
//         if(!err){
//             console.log('文件状态为',info)
//         }
//     })
// })

// 文件的读写
fs.writeFile('./demo.txt','你好啊',{flag:'a'},(err)=>{
    if(!err){
        console.log('文件写入成功')
    }
})

// fs.readFile('./demo.txt',{encoding:'utf-8'},(err,info)=>{
//     if(!err){
//         console.log('文件内容为',info)
//     }
// })

// 文件夹的操作
// fs.existsSync('work')
// fs.mkdirSync('work');
// fs.rename('./work','./hupu',()=>{})

// 读取某个文件夹下所有文件名称 
function getFiles(dirname){
    fs.readdir(dirname,{withFileTypes:true},(err,files)=>{
        console.log('files',files)
        files.forEach(file=>{
            if(file.isDirectory()){
                const directoryName = path.resolve(dirname,file.name)
                getFiles(directoryName);
            }else{
                console.log('file',file.name);
            }
        })
    })
}

getFiles('../Demos');

