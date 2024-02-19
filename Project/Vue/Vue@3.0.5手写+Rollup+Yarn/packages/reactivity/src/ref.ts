/**
 * 将普通类型转化为一个对象
 * 这个对象有value属性指向原来的原始值
 * name.value
 * name.value = xxx;
 *
 */
import { isObject } from "@gg-vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TraggerOpTypes } from "./operations";
import { reactive } from "./reactive";

/**
 * @description 如果rawValue是一个对象 将其转化为响应式的对象后返回
 * @param rawValue 用户调用ref()时传入的值 可能是对象可能是基本值
 * @returns
 */
function convert(rawValue) {
  if (isObject(rawValue)) {
    return reactive(rawValue);
  } else {
    return rawValue;
  }
}

/**
 * 核心：ref和reactive的区别
 * reactive内部使用proxy实现拦截
 * ref内部使用类的访问器和取值器 其实编译之后就是definProperty实现拦截
 *
 * ref可以接受一个value的值为对象或者原始值
 * 返回的是一个RefImpl的实例
 */
export function ref(value) {
  return createRef(value);
}

export function shallowRef(value) {
  return createRef(value, true);
}

function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow);
}

/**
 * TypeScript的类
 * 1. 所有可以this.xxx访问的属性必须要在顶部通过public或privite声明
 * 2. 在ts类的构造器函数的参数中声明并添加public或privite声明，会默认执行：this.xxx = xxx的行为
 *    代表属性就被默认放到this实例上了
 */
class RefImpl {
  public _value; // 取值和存值的时候公共操作的值 有可能是原始值 也有可能是Proxy后的值
  public __v_isRef = true; // 标识是否为一个RefImpl实例

  /**
   *
   * @param rawValue 永远暴露的是未被代理过的值
   * @param shallow 是否浅劫持
   */
  constructor(public rawValue, public shallow) {
    // 如果是浅劫持 就直接赋值即可 否则需要将每一层都转化为响应式的值
    this._value = shallow ? rawValue : convert(rawValue);
  }

  /**
   * @description 外部执行 state.value 进行依赖收集
   */
  get value() {
    track(this, TrackOpTypes.GET, "value");
    return this._value;
  }

  /**
   * @description 外部执行 state.value = xxx 进行通知更新
   */
  set value(newValue) {
    if (newValue !== this.rawValue) {
      // 每次设置值的时候再次判断
      this._value = this.shallow ? newValue : convert(newValue);
      this.rawValue = newValue;
      trigger(this, TraggerOpTypes.SET, "value", newValue);
    }
  }
}

export function isRef(target) {
  return Boolean(target?.__v_isRef === true);
}

/**
 *
 * @description 将target对象的key属性转换为一个Ref实例并返回 返回的ref和源对象target保持同步更改
 * 将targte[key]的访问形式 转化为 属性访问器.value的形式
 * @param target
 * @param key
 */
export function toRef(target, key) {
  if (isRef(target[key])) {
    return target[key];
  } else {
    // 这里其实很简单 就是对象引用值地址传递过去操作即可
    return new ObjectRefImpl(target, key);
  }
}

/**
 * @description 将一个响应式对象转换为一个普通对象，这个普通对象的每个属性都是指向源对象相应属性的 ref
 * @param target
 * @use 从组合式函数中返回响应式对象时，toRefs 相当有用 消费者组件可以解构/展开返回的对象而不会失去响应性：
 * 直接对一个reactive的对象进行解构会丢失响应式
 * 但是可以先对响应式对象执行toRefs操作将其转化为普通对象
 * 然后解构到每一个属性对应的值都是一个toRef的返回值就不会丢失响应式
 */
export function toRefs(target) {
  const ret = Array.isArray(target) ? [] : {};
  for (const key in target) {
    ret[key] = toRef(target, key);
  }
  return ret;
}

class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public target, public key) {}

  get value() {
    return this.target[this.key];
  }

  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

export function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}
