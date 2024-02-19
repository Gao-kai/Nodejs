import { existsSync, readFileSync, writeFileSync } from "fs";
import ini from "ini";
export const defaultConfig = {
    organization: "clean-cli",
    token: '65e85da63d158cdce29e44e109216a36',
    branch: "master"
};
// 用户存放配置文件的路径 后续基于此路径进行配置的增删改查
export const platForm = process.platform;
export const configPath = `${process.env[platForm === 'darwin' ? 'HOME' : 'USERPROFILE']}/.fastclirc`;
export function getUserConfig() {
    const isExist = existsSync(configPath);
    // 如果配置文件不存在 那么先创建一个配置文件
    if (!isExist) {
        writeFileSync(configPath, "");
    }
    // 读取配置文件 但是是rc格式 需要转化为对象 得到用户自定义的配置信息
    const content = readFileSync(configPath, "utf-8");
    const customConfig = ini.decode(content);
    // 将读取到的配置文件和默认的配置信息进行合并 得到最终合并后的配置信息
    let finalConfig = {};
    Object.assign(finalConfig, defaultConfig, customConfig);
    return finalConfig;
}
