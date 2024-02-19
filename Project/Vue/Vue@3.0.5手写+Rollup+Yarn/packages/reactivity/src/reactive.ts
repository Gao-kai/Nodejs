import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

import { isObject } from "@gg-vue/shared";

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers);
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers);
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers);
}

export const enum ReactiveFlags {
  SKIP = "__v_skip",
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  RAW = "__v_raw",
}

// 存放响应代理的缓存 以target为key 以代理对象proxy为value
export const reactiveMap = new WeakMap();
// 存放只读代理的缓存
export const readonlyMap = new WeakMap();

/**
 *
 * @description 基于传入的target和isReadonly等配置创建一个Proxy响应式对象并返回
 * @param target 要代理的目标对象
 * @param isReadonly 是否只读
 * @param baseHandlers Proxy中的handles拦截器
 */
function createReactiveObject(target, isReadonly, baseHandlers) {
  // 只有目标是对象 才可以进行属性劫持
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }

  // 如果对象已经被代理过了 那么优先读取缓存 不进行重复的代理
  const proxyMap = isReadonly ? readonlyMap : reactiveMap;
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  // 创建响应式对象
  const proxy = new Proxy(target, baseHandlers);

  proxyMap.set(target, proxy);
  return proxy;
}

export function toRaw(observed) {
  return observed[ReactiveFlags.RAW] || observed;
}

/**
 * @description 将一个对象打上SKIP标记 以便于跳过响应式包装
 * @param value
 */
export function markRaw(value) {
  Object.defineProperty(value, ReactiveFlags.SKIP, {
    enumerable: false,
    configurable: true,
    value,
  });
  return value;
}
