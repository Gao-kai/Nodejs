async function next() {
    console.log(1);
    demo();
    console.log(2);
  }
  
  function logger() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("等待3秒");
        resolve();
      }, 3000);
    });
  }
  
  async function demo() {
    console.log(3);
    await logger();
    console.log(4);
  }
  
  
  /****
   * 
   * 打印结果：
   * 1
   * 3
   * 2
   * 等待3秒
   * 4
   * 
   * 为什么不是 1 3 等待3秒 4 2 呢？
   * 这是因为next方法虽然有async标记，但是内部没有await demo()
   * 也就是说没有等待demo函数的执行完毕 
   * next方法只是同步执行了demo函数 至于demo函数什么时候执行完成它并不关心
   * 所以会同步执行1 3 2 
   * 然后等待logger  然后执行4
   * 
   * 但是我们要实现等待的效果怎么办？那就是给每一个next加上await关键字
   * 这样在整个过程中都会存在等待执行的效果
   * 也就是一个promise等待另外一个promise的执行完毕
   * 1 3 等待3秒 4 2
   */
  next();