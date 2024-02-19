export let activeEffect = undefined;
export let effectStack = [];

export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

/**
 * 让effect记录用了哪些属性 也就是deps
 * 让属性记录那些effect依赖了它这个属性
 *
 * @param fn
 * 0. fn会先执行一次
 * 1. 可根据状态变化重新执行
 * 2. 可以嵌套着写 因为组件就是嵌套的
 *
 * 将fn包装为响应式
 */

export class ReactiveEffect {
  // 默认为表示当前这个effect为激活状态
  public active = true;
  public deps = [];

  /* 修饰符public就等于this.fn = fn */
  constructor(public fn, public scheduler?) {}

  run() {
    /* effect如果是非激活状态 只需要执行函数 而不需要依赖收集 */
    if (!this.active) {
      return this.fn();
    }

    /* 走到这里表示进行依赖收集 核心就是将当前的effect也就是this实例和稍后
        渲染的属性关联在一起
    */

    // 避免同一个effect多次执行
    if (!effectStack.includes(this)) {
      try {
        effectStack.push(this);
        // 保证执行fn的时候全局上一定保存的是当前的activeEffect实例
        activeEffect = this;
        //   稍后proxy中进行get操作的时候就可以获取到这个全局的activeEffect和渲染的属性做关联
        //   return是为了实现计算属性
        return this.fn();
      } finally {
        // 执行完成之后先从栈中弹出 然后将最后一个赋值给activeEffect
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  }

  /**
   * 停止effect和它所关联的deps的联系 中止响应式
   */
  stop() {
    if (this.active) {
      cleanEffect(this);
      this.active = false;
    }
  }
}

/**
 * 清理响应式
 * @param effect
 */
function cleanEffect(effect) {
  let { deps } = effect;
  // deps中是一个个的Set结构
  for (const dep of deps) {
    dep.delete(effect);
  }
}

/**
 * 依赖收集时机
 * 只有当属性的getter在effect中触发的时候
 * 才可以收集 在其他地方触发的话 不需要收集
 * @returns
 */
export function isTracking() {
  return activeEffect !== undefined;
}

/**
 * 依赖收集 那个对象的那个属性依赖当前激活的activeEffect
 * @param target
 * @param key
 *
 * trackMap = {
 *  target:{
 *      key:[e1,e2]
 *  }
 * }
 *
 */
// key是对象 value又是一个map 这个map中所有的key都是当前这个对象的key
const trackMap = new WeakMap();

export function track(target, key) {
  //   console.log({ target, key, activeEffect });
  /* 如果不是在effect的函数中执行的 那么不用执行依赖手机 */
  if (!isTracking()) return;

  /* 开始依赖收集 */
  //   获取是否是同一个对象的多次收集比如 state.age 和 state.name
  let targetKeysMap = trackMap.get(target); // 拿到存放相同对象key组成的普通map
  if (!targetKeysMap) {
    targetKeysMap = new Map();
    trackMap.set(target, targetKeysMap);
  }

  let depsSet = targetKeysMap.get(key); // 拿到存放dep的set
  if (!depsSet) {
    depsSet = new Set();
    targetKeysMap.set(key, depsSet);
  }

  trackEffects(depsSet);
  // console.log(trackMap);
}

/**
 * 属性收集
 * @param dep Set
 */
export function trackEffects(depSet) {
  /* 是否对同一个对象的同一个属性进行多次手机 state.age和state.age */
  const shouldTrack = !depSet.has(activeEffect);
  if (shouldTrack) {
    // 一个依赖记录自己被多少个effect/组件使用
    depSet.add(activeEffect);
    // 一个组件activeEffect记录自己有哪些依赖 name age myAge
    activeEffect.deps.push(depSet);
  }
}

export function triggerEffects(effects) {
  for (const effect of effects) {
    // 如果当前的effect和当前的activeEffect是一样的
    // 那就不要执行了 避免在effect中出现state.age = Math.random()的loop
    if (effect !== activeEffect) {
      // 又调度器就直接走调度器函数
      if (effect.scheduler) {
        return effect.scheduler();
      }
      effect.run();
    }
  }
}

export function trigger(target, key) {
  //   debugger;
  let targetKeysMap = trackMap.get(target);
  if (!targetKeysMap) return;

  //   updateDeps = name属性对应的set集合 这个set中存放着去重之后的effect列表
  let depsSet = targetKeysMap.get(key); // 拿到key对应存放dep的set
  let updateDeps = [];
  if (key !== undefined) {
    updateDeps.push(depsSet);
  }

  let effects = [];
  for (const dep of updateDeps) {
    // 这里的dep就是set集合 里面有多个effect
    dep && effects.push(...dep);
  }

  triggerEffects(effects);
}
