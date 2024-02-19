const { Readable } = require("stream");

/**
 *
 * @param {*} stream 可能是一个可读流比如文件 也可能是一个字符串
 */
async function readBody(stream) {
  // 只有是流也就是读取静态js文件才进行处理
  if (stream instanceof Readable) {
    return new Promise((resolve) => {
      let res = "";
      // 拼接字节
      stream.on("data", (chunk) => {
        res += chunk;
      });

      // 可读流读取完毕 返回
      stream.on("end", () => {
        resolve(res);
      });
    });
  } else {
    return stream.toString();
  }
}

module.exports = readBody;
