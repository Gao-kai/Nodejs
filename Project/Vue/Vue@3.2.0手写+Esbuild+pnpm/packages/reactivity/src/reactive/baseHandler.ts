import { ReactiveFlags } from "../types";
import { track, trigger } from "../effect/index";
import { isObject } from "@gg-vue/shared";
import { reactive } from "./index";
export const mutableHandlers = {
  /* 依赖收集 */
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 先拿到获取的值 比如obj.a = {b:1} 先拿到这个{b:1}
    const value = Reflect.get(target, key, receiver);
    track(target, key);
    // 深度代理
    if (isObject(value)) {
      return reactive(value);
    }
    return value;
  },
  /* 通知执行 */
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const res = Reflect.set(target, key, value, receiver);
    // 每次赋值的值不同 才需要依赖
    if (oldValue !== value) {
      trigger(target, key);
    }
    return res;
  },
};
