import { isObject } from "@gg-vue/shared";
import { mutableHandlers } from "./baseHandler";
import { ReactiveFlags } from "../types";
/**
 * 将传入的对象target 转化为响应式数据然后返回
 * @param target
 */
const reactiveMap = new WeakMap();

export function reactive(target) {
  if (!isObject(target)) return;

  /* 检查target是否是已经代理过的proxy对象 保证一个对象只加入一次reactiveMap */
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  /* 然后检查缓存 */
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }

  /**
   * Proxy并不会将源对象重新定义属性的getter和setter
   * 而是创建了一个代理 并不会在底层修改原对象 这一点和defineProperty是完全不同的
   */
  const proxy = new Proxy(target, mutableHandlers);

  /* 加入缓存 */
  reactiveMap.set(target, proxy);

  return proxy;
}

/**
 * 如果rawValue是一个对象 那么转化为响应式对象
 * 如果rawValue是一个普通值 那么直接返回原值
 * @param rawValue
 */
export function toReactive(rawValue) {
  return isObject(rawValue) ? reactive(rawValue) : rawValue;
}
