let quene = [];

/**
 * @description 将job进行去重之后推入到一个队列上
 * 避免连续更新三次相同的age 不需要连续执行三次age对应的effect执行
 *  state.age = 20;
 *  state.age = 20;
 *  state.age = 20;
 *
 * @param job 其实就是组件的effect函数 执行effect函数内部会执行render函数 重新取值进行渲染
 */
export function queneJob(job) {
  console.log("调度器执行");
  if (!quene.includes(job)) {
    quene.push(job);
    queueFlush();
  }
}

let isFlushPending = false;
/**
 * @description 通过哨兵变量和浏览器的eventLoop机制来实现的队列刷新
 * 等待当前轮循环的所有执行栈的任务执行完毕 然后执行微任务Promise.resolve().then
 * 好处是同一轮事件循环中 无论quenejob执行了N次
 * 保证flushJobs只执行一次
 *
 * 避免了：
 * state.age = 100;
 * state.name = 'xx';
 * state.xx = 50
 *
 * 这种同一轮事件循环中连续执行三次effect去更新同一组件的问题
 */
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true;
    Promise.resolve().then(flushJobs);
  }
}

/**
 * @description 刷新队列 就是将队列中每一job取出来执行 但是在执行前需要排序
 * 1. 保证先刷新父组件的effect 后刷新子组件的effect
 *    因为effect的id总是父亲小于儿子
 *    避免子组件刷新完了 又修改了父组件 导致父组件重新刷新
 *
 * 2. 如果在父组件执行effect更新期间子组件已经被卸载了 那么可以跳过子组件的effect执行
 */
function flushJobs() {
  isFlushPending = false;
  quene.sort((a, b) => a.id - b.id);
  for (const job of quene) {
    job();
  }
  quene.length = 0;
}

// queneJob(effect)
// queneJob(effect)
// queneJob(effect)
// queneJob(effect)
// queneJob(effect)

export function nextTick(fn): Promise<void> {
  return Promise.resolve().then(fn);
}
