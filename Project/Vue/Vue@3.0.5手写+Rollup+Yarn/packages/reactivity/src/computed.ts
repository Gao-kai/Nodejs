import { isFunction } from "@gg-vue/shared";
import { effect, track, trigger } from "./effect";
import { TrackOpTypes, TraggerOpTypes } from "./operations";

export function computed(getterOrOptions) {
  let getter;
  let setter;

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get || (() => {});
    setter = getterOrOptions.set || (() => {});
  }

  // 创建一个计算属性的实例
  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  public _dirty = true;
  public effect;
  private _value;

  constructor(getter, public setter) {
    /**
     * 将计算属性传入的getter看做是一个effect的fn 创建一个effect函数并返回
     * effect有什么用呢？
     * 执行effect可以执行包裹的fn也就是getter
     * 执行getter的过程中会进行依赖收集
     * 后续getter函数中用到的属性发生变化就可以触发属性更新
     *
     * lazy属性表示不会立即执行effect
     * scheduler属性表示更新的时候不走默认执行effect逻辑 而是走scheduler调度器逻辑
     * scheduler采用对象属性写法this是这个options对象
     * scheduler采用箭头函数写法this是计算属性实例
     */
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
        }
        // 每次计算属性依赖的属性比如name变化了
        // 需要通知依赖计算属性自己的上一层effect也更新
        trigger(this, TraggerOpTypes.SET, "value");
      },
    });
  }

  get value() {
    if (this._dirty) {
      // effect执行的返回值就是getter的返回值
      const res = this.effect();
      this._value = res;
      this._dirty = false;
    }
    // 计算属性实例可以把自己当做对象target 进行依赖收集
    track(this, TrackOpTypes.GET, "value");
    // 然后将值返回
    return this._value;
  }

  //   计算属性不需要主动更新setter
  set value(newValue) {
    this.setter(newValue);
  }
}
