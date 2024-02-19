/**
 * Notes:
 * 1. 避免写重复的radonl的setter 使用assign进行解耦
 * 2. 函数柯里化的思想
 * 3. 为什么用Reflect.get而不是target[key]
 *      + ES Next以后会将Object上的方法迁移到Reflect来
 *      + target[key]=value设置值就算设置失败也不会异常 但是Reflect设置值具有返回值
 *      + 解决源对象中有get访问器属性的时候修改源对象中name的值不引起响应式更新的bug
 * 4. Object.assign会修改第一个参数的值 很难注意到的bug
 */

import { isObject, isArray, isIntegerKey, hasOwn } from "@gg-vue/shared";
import {
  readonly,
  reactive,
  ReactiveFlags,
  reactiveMap,
  readonlyMap,
} from "./reactive";
import { TrackOpTypes, TraggerOpTypes } from "./operations";
import { track, trigger } from "./effect";

/**
 * @description 创建一个get拦截函数并返回 依赖收集在此发生
 * @param isReadonly 是否只读
 * @param shallow 是否为浅劫持
 */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    if (
      key === ReactiveFlags.RAW &&
      receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)
    ) {
      return target;
    }

    const result = Reflect.get(target, key, receiver);

    // 如果不是只读的 进行依赖收集
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key);
    }

    // 如果是浅收集 那么直接返回即可
    if (shallow) {
      return result;
    }

    /* 
        vue3.0的懒代理
        + vue2.0是一上来就对对象进行递归劫持
        + vue3.0是取值取到一个对象的时候才去代理
    */
    if (isObject(result)) {
      return isReadonly ? readonly(result) : reactive(result);
    }

    return result;
  };
}

/**
 * @description 创建一个set拦截函数并返回 通知更新在此发生 新增 - 修改 - 相等
 * @param shallow 是否为浅劫持
 */
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    // 获取旧值
    const oldValue = target[key];

    /**
     * 判断1：setter的时候是修改值还是新增值？
     * 1. 如果target是数组并且key是有效索引 那么就判断修改的索引key是否小于数组长度 如果是那么就是修改 否则就是新增
     * 2. 否则target就是对象 那么就判断当前对象target上是否存在属性key 如果存在就是修改 否则就是新增
     * 3. Proxy的强大之处就是可以监控到任何修改数组和对象的行为 比如修改数组的索引和新增对象属性 在Vue2中要用$set方法实现
     */

    const isExistKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);

    // 获取设置后的返回值用于setter方法的返回值
    const res = Reflect.set(target, key, value, receiver);

    if (!isExistKey) {
      // 走新增的更新
      trigger(target, TraggerOpTypes.ADD, key, value);
    } else if (oldValue !== value) {
      // 走修改的更新
      trigger(target, TraggerOpTypes.SET, key, value, oldValue);
    }

    return res;
  };
}

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter(true);

export const mutableHandlers = {
  get,
  set,
};

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key) => {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    );
    return true;
  },
};

export const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
