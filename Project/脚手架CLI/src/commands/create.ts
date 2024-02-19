import path from 'path';
import { existsSync,rmSync } from 'fs';
import inquirer from 'inquirer'
import chalk from 'chalk'
import {wrapLoading} from '../utils/loading.js'
import { exec } from 'child_process';
import { promisify } from 'util';
import {defaultConfig,getUserConfig} from '../constant.js'


// 导入gitee Api 
import {getOrgProjects} from '../utils/project.js'

interface IOptions {
    force:Boolean
}


export default async function(projectName:string,options:IOptions){
    console.log('执行 create 命令！',{
        projectName,
        options,
        process:process.cwd()
    });

    // 获取当前项目的工作目录
    const cwd = process.cwd();

    // 获取要安装的目标目录
    const targetDir = path.join(cwd,projectName);

    if(existsSync(targetDir)){
        if(options.force){
            // 删除以前的文件夹下所有目录
            rmSync(targetDir,{recursive:true})
        }else{
            /****
             * 讯问用户 是否需要删除
             * inquirer.prompt方法返回一个promsie 
             * 返回的结果是对象 {key(name对应的action):value(choices中用户选中的value)}
             * type还可以是checkbox 
             */
            let {action} = await inquirer.prompt([
                {
                    name:'action',
                    type:'list', // checkbox  list confirm
                    message:"当前目录已经存在，是否覆盖?",
                    choices:[
                        {name:"overwrite",value:"overwrite"},
                        {name:"cancel",value:false}
                    ]

                }
            ])
            console.log('action',action);

            if(!action){
                return console.log(`${chalk.red('用户取消创建！')}`);
            }

            if(action === 'overwrite'){
                await wrapLoading(`${chalk.red('正在移除旧目录...')}`, ()=>rmSync(targetDir,{recursive:true}))
                console.log(`${chalk.green('移除成功！')}`);
            }
        }
    }

    // 下一步就是获取项目模板仓库 拉取对应的项目

    // 获取对应组织下的所有模板仓库列表 并让用户选择
    const projects = await getOrgProjects();
    const projectList = projects.map(item=>item.name);
    let {templateName} = await inquirer.prompt([
        {
            name:'templateName',
            type:'list', // checkbox  list confirm
            message:"请选择生成模板",
            choices:projectList
        }
    ])
    console.log('templateName',templateName);

    // 需要将仓库代码下载到本地 这中间可以插入分支和tag的选择 
    // 方案1：download-git-repo 有关的库
    // 方案2：本地调用cwd命令 git clone

    const execPromisify = promisify(exec);
    const {organization,branch} = getUserConfig() as any;
    // 指定分支和最近一次提交
    // 将仓库内容clone到本地projectName目录下
    const execCwd = `git clone --branch ${branch} --depth 1 https://gitee.com/${organization}/${templateName}.git ${projectName}`

    wrapLoading('正在下载模板...',async ()=>{
        await execPromisify(execCwd);
        
        const cwdPath = `${cwd}/\\${projectName}`
        console.log('成功创建项目：',chalk.red(cwdPath));
        
        
        // 删除原来的.git目录
        return rmSync(`${projectName}/.git`,{recursive:true})
    })
   
}