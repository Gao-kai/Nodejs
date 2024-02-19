import { isArray, isIntegerKey } from "@gg-vue/shared";
import { TrackOpTypes, TraggerOpTypes } from "./operations";

type Dep = Set<ReactiveEffect>;

interface ReactiveEffectOptions {
  lazy?: boolean;
  scheduler?: (job: ReactiveEffect) => void;
  onTrack?: (event) => void;
  onTrigger?: (event) => void;
  onStop?: () => void;
  allowRecurse?: boolean;
}

interface ReactiveEffect<T = any> {
  (): T;
  _isEffect: true;
  id: number;
  active: boolean;
  raw: () => T;
  deps: Array<Dep>;
  options: ReactiveEffectOptions;
}

/**
 * @description 响应式的核心实现effect函数
 * @param fn 回调函数
 *
 * 1. 默认会将传入的fn立即执行 如果是lazy 那么不会立即执行
 */
export function effect(fn, options: ReactiveEffectOptions = {}) {
  const effect = createReactiveEffect(fn, options);

  if (!options.lazy) {
    effect();
  }

  return effect;
}

/**
 * @description 每次执行当前的effect重新渲染的时候 首先把存储的deps清空 避免重复执行effect
 * @param effect 当前执行的effect函数
 */
function cleanup(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (const dep of deps) {
      dep.delete(effect);
    }
    deps.length = 0;
  }
}

let uid = 0;
let activeEffect: ReactiveEffect<any>;
// 栈结构主要是用于解决effect的嵌套执行 因为组件就是嵌套的
const effectStack: Array<ReactiveEffect> = [];

/**
 * @description 创建一个effect副作用函数并返回 执行这个effect函数可以添加对内部响应式数据的主动观测
 * @param fn
 * @param options
 * @returns
 */
function createReactiveEffect(
  fn,
  options: ReactiveEffectOptions
): ReactiveEffect<any> {
  const effect = function reactiveEffect() {
    // 解决一个effect被无限循环执行 eg:effect(()=>{state.age++})
    // debugger;
    if (!effectStack.includes(effect)) {
      // 每次执行前先做一个cleanup
      cleanup(effect);

      // 执行fn回调会去代理对象上取值 依赖收集就是在这里发生的
      try {
        effectStack.push(effect);
        activeEffect = effect;
        const res = fn();
        return res; // 后续计算属性需要这个函数执行的结果
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  } as ReactiveEffect;

  /* 给创建出来的effect打上标记 */
  effect.id = uid++;
  effect._isEffect = true;
  effect.raw = fn;
  effect.options = options;
  effect.active = true;
  effect.deps = [];

  return effect;
}

const targetMap = new WeakMap();
/**
 * @description 属性的依赖收集
 * @param target 那个对象
 * @param type 属性收集的类型
 * @param key 那个属性
 */
export function track(target, type: TrackOpTypes, key) {
  // debugger;
  if (activeEffect === undefined) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (!dep.has(activeEffect)) {
    // 让属性记住依赖(组件)：更新当前target对象的key属性所收集的依赖Set集合 Set{effect1,effect2}
    dep.add(activeEffect);
    // 让依赖(组件)也记住属性:将当前这一刻的属性自身的dep也就是Set集合(存放着当前属性的所有依赖effect)
    activeEffect.deps.push(dep);
  }

  console.log(
    "依赖收集完成一次，当前的targetMap是 === > ",
    "\r\n",
    target,
    "\r\n",
    key,
    "\r\n",
    targetMap
  );
}

/**
 * @description 属性的更新通知
 * @param target
 * @param type
 * @param key
 * @param newValue
 * @param oldValue
 */
export function trigger(target, type, key?, newValue?, oldValue?) {
  // debugger;
  let depsMap = targetMap.get(target);
  // 如果在weakMap依赖收集集合中找不到这个对象 说明没有被收集 那么不用更新
  if (!depsMap) return;

  // 新建一个Set集合用来存储本次更新的所有effect 目的是去重
  const effects = new Set();

  /**
   * @description 专门用于更新时将属性key对应的dep 也就是Set集合都添加到统一的effects中
   * @param effectToAdd
   */
  const add = (effectToAdd) => {
    if (effectToAdd) {
      // 遍历Set集合 然后依次添加
      for (const effect of effectToAdd) {
        effects.add(effect);
      }
    }
  };

  /**
   * 特殊处理1：关于数组length的更新
   * 场景：如果在依赖收集的时候对于某个数组arr的length属性和索引属性都进行了收集，比如：
   *  const state = reactive([100,200,300])
   *  state[2] state.length 此时页面渲染：300和3
   *
   *  如果后续修改了length属性的值 此时就需要特殊处理，比如：
   *  + state.length被修改为大于等于原来length的值
   *    比如state.length = 5 此时只需要找到length收集的依赖进行更新
   *  + state.length被修改为小于原来length的值
   *    比如state.length = 0 此时不仅需要更新length依赖
   *    还需从依赖集合中找到当前收集的所有数组索引属性比如'2' 然后更新相关依赖
   *    因为数组的长度都变为0了 数组应该为空 此时页面应该为：undefined和0
   *
   */
  if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key) => {
      // 这里的key可能是length 也可能是数字索引属性 newValue就是被新赋值的长度
      if (key === "length" || key >= newValue) {
        add(dep);
      }
    });
  } else {
    // 走到这里只能是：对象属性更新 或 数组索引属性更新
    if (key !== undefined) {
      add(depsMap.get(key));
    }

    /**
     * 如果直接修改了数组的索引属性并因此修改了length,比如：
     * const state = reactive([100,200,300])
     * state.length 依赖收集 渲染3
     *  state[100] = 0;
     * 此时数组的length会变为100 需要触发length有关的依赖 渲染 100 200 300，，，，，，0
     */
    switch (type) {
      case TraggerOpTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get("length"));
        }
        break;

      default:
        break;
    }
  }

  // 触发更新 也就是取出当前属性key的每一个effect然后执行 再次更新的时候会重新去依赖收集触发getter并拿到更新后的值
  // 在页面上的表现就是视图上绑定的依赖属性都发生了变化
  effects.forEach((effect: any) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}
