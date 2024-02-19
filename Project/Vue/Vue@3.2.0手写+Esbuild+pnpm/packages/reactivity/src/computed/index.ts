import { isFunction } from "@gg-vue/shared";
import {
  ReactiveEffect,
  isTracking,
  trackEffects,
  triggerEffects,
} from "../effect/index";
/**
 * 计算属性实现
 * 1. 计算属性也需要依赖收集
 * 2. dirty
 * 3. 自身本来就是一个effect
 * 4. 表示__v_isRef
 */
export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;

  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  /**
   * 计算属性默认是脏的
   * 第一次取值 会执行getter 执行过后变为false
   * 后续再去取值先进行判断
   *  如果依赖没变 直接返回缓存的值
   *  如果依赖变了 就将dirty修改为true 重新执行一次返回新值
   * 重新执行过后又会变为false
   */
  public _dirty: boolean = true;
  public dep: any; // 计算属性自己的依赖 比如name
  public isRef: boolean = true; // Ref才可以用.value取值
  public effect: any; // 计算属性的依赖于effect
  public _value: any;

  /**
   *
   * @param getter 计算属性取值时触发的函数
   * @param setter 计算属性存值时触发的函数
   *
   * 但是计算属性的取值不是直接取myAge 而是myAge.value才会触发
   * 计算属性的取值不是直接设置myAge = xxx 而是myAge.value = xxx才会触发
   *
   */
  constructor(public getter, public setter) {
    // 将计算属性包装为一个effect 可以实现依赖收集
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerEffects(this.dep);
      }
    });
  }

  /**
   * 收集依赖 怎么收集
   * 用effect包装为回调
   * 就会完成依赖收集
   *
   * 什么时候收集
   * 当myAge.value的取值在effect的回调中执行的时候才做依赖收集
   * 其实就是计算属性的值和渲染模板有关系的时候才进行依赖收集
   * 如果没用到 那么只执行就好了 没必要依赖收集
   */
  get value() {
    if (isTracking()) {
      trackEffects(this.dep || (this.dep = new Set()));
    }

    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }

    return this._value;
  }

  /**
   * 就触发用户自己传入的setter就好了
   */
  set value(newValue) {
    this.setter(newValue);
  }
}
