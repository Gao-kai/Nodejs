const fs = require("fs-extra");
const path = require("path");

async function writeFileTree(dir, files) {
  Object.keys(files).forEach((fileName) => {
    const filePath = path.resolve(dir, fileName);
    // 确定要写入的目录是否存在 如果不存在 那就新建一个 如果存在直接写入
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, files[fileName]);
  });
}

module.exports = writeFileTree;
