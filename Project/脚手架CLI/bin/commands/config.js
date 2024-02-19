import { configPath, getUserConfig } from "../constant.js";
import { writeFileSync } from "fs";
import ini from "ini";
import chalk from "chalk";
export default function (value, option) {
    // value等于1  用户选择的选项是：{set:"a"}
    console.log({
        value,
        option,
    });
    // 获取用户的动作是get set还是del
    const action = Object.keys(option)[0];
    //   获取用户当前配置文件rc中的所有字段信息
    const config = getUserConfig();
    console.log({
        config
    });
    // 获取用户要操作的配置项的key 比如set name = 1 name就是key
    const key = option[action];
    switch (action) {
        case "get":
            console.log(chalk.green(config[key]));
            break;
        case "set":
            config[key] = value;
            writeFileSync(configPath, ini.encode(config));
            break;
        case "del":
            delete config[key];
            writeFileSync(configPath, ini.encode(config));
            break;
        default:
            break;
    }
}
