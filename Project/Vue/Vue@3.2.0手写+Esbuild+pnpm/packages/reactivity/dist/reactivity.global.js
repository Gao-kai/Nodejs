var GGVueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    ReactiveEffect: () => ReactiveEffect,
    activeEffect: () => activeEffect,
    computed: () => computed,
    effect: () => effect,
    effectStack: () => effectStack,
    isTracking: () => isTracking,
    reactive: () => reactive,
    ref: () => ref,
    shallowRef: () => shallowRef,
    toReactive: () => toReactive,
    track: () => track,
    trackEffects: () => trackEffects,
    trigger: () => trigger,
    triggerEffects: () => triggerEffects
  });

  // packages/reactivity/src/effect/index.ts
  var activeEffect = void 0;
  var effectStack = [];
  function effect(fn) {
    const _effect = new ReactiveEffect(fn);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.active = true;
      this.deps = [];
    }
    run() {
      if (!this.active) {
        return this.fn();
      }
      if (!effectStack.includes(this)) {
        try {
          effectStack.push(this);
          activeEffect = this;
          return this.fn();
        } finally {
          effectStack.pop();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    }
    stop() {
      if (this.active) {
        cleanEffect(this);
        this.active = false;
      }
    }
  };
  function cleanEffect(effect2) {
    let { deps } = effect2;
    for (const dep of deps) {
      dep.delete(effect2);
    }
  }
  function isTracking() {
    return activeEffect !== void 0;
  }
  var trackMap = /* @__PURE__ */ new WeakMap();
  function track(target, key) {
    if (!isTracking())
      return;
    let targetKeysMap = trackMap.get(target);
    if (!targetKeysMap) {
      targetKeysMap = /* @__PURE__ */ new Map();
      trackMap.set(target, targetKeysMap);
    }
    let depsSet = targetKeysMap.get(key);
    if (!depsSet) {
      depsSet = /* @__PURE__ */ new Set();
      targetKeysMap.set(key, depsSet);
    }
    trackEffects(depsSet);
  }
  function trackEffects(depSet) {
    const shouldTrack = !depSet.has(activeEffect);
    if (shouldTrack) {
      depSet.add(activeEffect);
      activeEffect.deps.push(depSet);
    }
  }
  function triggerEffects(effects) {
    for (const effect2 of effects) {
      if (effect2 !== activeEffect) {
        if (effect2.scheduler) {
          return effect2.scheduler();
        }
        effect2.run();
      }
    }
  }
  function trigger(target, key) {
    let targetKeysMap = trackMap.get(target);
    if (!targetKeysMap)
      return;
    let depsSet = targetKeysMap.get(key);
    let updateDeps = [];
    if (key !== void 0) {
      updateDeps.push(depsSet);
    }
    let effects = [];
    for (const dep of updateDeps) {
      dep && effects.push(...dep);
    }
    triggerEffects(effects);
  }

  // packages/shared/src/index.ts
  var isObject = (value) => {
    return typeof value === "object" && value !== null;
  };
  var isFunction = (value) => {
    return typeof value === "function";
  };

  // packages/reactivity/src/reactive/baseHandler.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      const value = Reflect.get(target, key, receiver);
      track(target, key);
      if (isObject(value)) {
        return reactive(value);
      }
      return value;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return res;
    }
  };

  // packages/reactivity/src/reactive/index.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target))
      return;
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    if (reactiveMap.has(target)) {
      return reactiveMap.get(target);
    }
    const proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }
  function toReactive(rawValue) {
    return isObject(rawValue) ? reactive(rawValue) : rawValue;
  }

  // packages/reactivity/src/computed/index.ts
  function computed(getterOrOptions) {
    const onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (onlyGetter) {
      getter = getterOrOptions;
      setter = () => {
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
  }
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.getter = getter;
      this.setter = setter;
      this._dirty = true;
      this.isRef = true;
      this.effect = new ReactiveEffect(getter, () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffects(this.dep);
        }
      });
    }
    get value() {
      if (isTracking()) {
        trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
      }
      if (this._dirty) {
        this._value = this.effect.run();
        this._dirty = false;
      }
      return this._value;
    }
    set value(newValue) {
      this.setter(newValue);
    }
  };

  // packages/reactivity/src/ref/index.ts
  function ref(value) {
    return createRef(value);
  }
  function createRef(rawValue) {
    return new RefImpl(rawValue);
  }
  var RefImpl = class {
    constructor(_rawValue) {
      this._rawValue = _rawValue;
      this._value = toReactive(_rawValue);
    }
    get value() {
      if (isTracking()) {
        trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
      }
      return this._value;
    }
    set value(newValue) {
      if (newValue !== this._rawValue) {
        this._rawValue = newValue;
        this._value = toReactive(this._rawValue);
        triggerEffects(this.dep);
      }
    }
  };
  function shallowRef(value) {
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
