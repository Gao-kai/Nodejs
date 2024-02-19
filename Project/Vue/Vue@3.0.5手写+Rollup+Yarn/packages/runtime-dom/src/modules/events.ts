/**
 *
 * 1. 更新前有 更新后有 此时需要patch 也就是先从缓存中取出之前存的函数引用listenter 然后修改它的指向为新的value即可
 * 2. 更新前有 更新后无 此时删除缓存并且解绑dom事件
 * 3. 更新前无 更新后有 此时新增缓存且绑定dom事件
 *
 * @param el dom元素
 * @param key 事件名称 比如onclick
 * @param prevValue fn1
 * @param nextValue fn2
 */
export function patchEvent(el, key, prevValue, nextValue) {
  const invokers = el._vueEventInvokers || (el._vueEventInvokers = {});
  const existingInvoker = invokers[key];

  if (existingInvoker && nextValue) {
    // 更新绑定的函数
    existingInvoker.value = nextValue;
  } else {
    const eventName = key.slice(2).toLowerCase(); // 'click mouseenter scroll'

    if (nextValue) {
      // 如果新的dom上有key也有value 那么就说明新增一个事件
      let invoker = createInvoker(nextValue);
      invokers[key] = invoker; // 加入缓存
      el.addEventListener(eventName, invoker);
    } else {
      // 如果没有新值 那么移除之前
      el.removeEventListener(eventName, existingInvoker);
      invokers[key] = null; // 移除缓存
    }
  }
}

/**
 * 将用户绑定在事件上的函数包装成为一个匿名函数的调用 并用一个变量value保存它
 * 以便于后续直接取读取和改写这个函数的引用即可完成对事件函数的修改
 * 更新前：div @click="fn1"
 * 更新后：div @click="fn2"
 *
 * 1. 先移除fn1 然后新增绑定fn2
 * 2. 不能绑定两次 不会覆盖 会添加到事件队列中
 * 3. 用函数包装
 *
 * 更新前：div onClick="fn1"
 *        let listenter = (e)=>fn1(e);
 *        listenter.value = fn1
 *        div onClick="listenter"
 *
 *
 * 更新后：div onClick="fn2"
 *        listenter.value = fn2 只需要修改listenter的引用
 *        div onClick="listenter" 并不需要重新对dom进行解绑和重新绑定
 * @param listener
 * @returns
 */
function createInvoker(listener) {
  const invoker = (e) => listener(e);
  invoker.value = listener;
  return invoker;
}
