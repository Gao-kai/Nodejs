import { isReactive, isRef, ref, toRaw, toRef } from "vue";

/**
 *
 * storeToRefs和toRefs的区别就是对函数进行了过滤
 * 只保留了store上类型为Vue中响应式的数据 然后将其转化为一个新的对象 对象的每一个key的值都是ref
 * 所以不要用toRefs 因为不会帮助我们过滤函数
 * @param {*} store
 * @returns
 */
export function storeToRefs(store) {
  // for循环会触发依赖收集 所以这里先转化为基本的
  store = toRaw(store);

  const refs = {};

  for (const key in store) {
    const value = store[key];
    if (isRef(value) || isReactive(value)) {
      refs[key] = toRef(store, key);
    }
  }

  return refs;
}
