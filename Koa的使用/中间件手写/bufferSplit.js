/**
 * Buffer本身是没有split方法的，但是Buffer具有：
 * 1. slice方法 可以截取buffer
 * 2. indexOf方法 可以获取某一个字节在buffer中的位置
 * 
 * 这个方法就是拓展的让BUffer具有截取的功能
 */
Buffer.prototype.split = function (sperator) {
    
  let speratorLen = Buffer.from(sperator).length;
  let offset = 0; // 偏移量
  let currIndex = 0; // 每一次开始截取的位置
  let result = [];

  // aaaaaa -- bbbbbb -- cccccc -- d
  while (this.indexOf(sperator, offset)!== -1) {
    // 获取分隔符所在的索引
    currIndex = this.indexOf(sperator, offset);
   

    // 截取从offset到currIndex之前的buffer 并放入result
    result.push(this.slice(offset, currIndex));

    // 刷新offset的值 等于当前currIndex加上自身长度 也就是下一次截取的起点位置
    offset = currIndex + speratorLen;

    // console.log('currIndex',currIndex);
    // console.log('offset',offset);
  }

  // 截取末尾剩余的
  result.push(this.slice(offset));

  return result;
};

// let testBuffer = Buffer.from("aaaaaa--bbbbbb--cccccc--d");
// console.log(testBuffer.split("--"));

// [
//     <Buffer 61 61 61 61 61 61>,
//     <Buffer 62 62 62 62 62 62>,
//     <Buffer 63 63 63 63 63 63>,
//     <Buffer 64>
// ]
