var GG_VueRuntimeDom = (function (exports) {
  'use strict';

  /**
   * @description 包含一系列的DOM节点操作方法
   */
  const nodeOps = {
      /**
       * 元素操作
       */
      createElement(tagName) {
          return document.createElement(tagName);
      },
      remove(child) {
          let parent = child.parentNode;
          if (parent) {
              parent.removeChild(child);
          }
      },
      /**
       * 将节点child插入到节点anchor的前面
       * 如果anchor为空 则等同于appendChild插入到末尾
       * @param child
       * @param parent
       * @param anchor
       */
      insert(child, parent, anchor = null) {
          parent.insertBefore(child, anchor);
      },
      setElementText(el, text) {
          el.textContent = text;
      },
      querySelector: (selector) => {
          return document.querySelector(selector);
      },
      /**
       * 文本操作
       */
      createText(text) {
          return document.createTextNode(text);
      },
      setText(node, text) {
          node.nodeValue = text;
      },
  };

  /**
   * 之前没有 现在有 取nextClass
   * 之前有 现在没有 nextClass为null 删除el删的所有class
   * 之前有 现在有 取nextClass
   * @param el
   * @param classValue
   */
  function patchClass(el, classValue) {
      if (!classValue) {
          classValue = "";
      }
      el.className = classValue;
  }

  /**
   * 1. 新的么有 说明样式不存在了 移除掉就好了
   * 2. 新的有 旧的也有
   * @param el
   * @param prevStyle 旧的style对象
   * @param nextStyle 新的style对象
   */
  function patchStyle(el, prevStyle, nextStyle) {
      // {color:'red',height:"10px"} => ""
      if (!nextStyle) {
          // 操作DOM的地方
          el.removeAttribute("style");
      }
      else {
          // 旧的style对象有 但是新的style对象中没有
          // {color:'red',height:"10px"} => {height:"10px"}
          if (prevStyle) {
              for (const key in prevStyle) {
                  if (nextStyle[key] == null) {
                      // 操作DOM的地方
                      el.style[key] = "";
                  }
              }
          }
          // 嘴周将新的style的属性无脑放到el上
          for (const key in nextStyle) {
              // 操作DOM的地方
              el.style.setProperty(key, nextStyle[key]);
          }
      }
  }

  function patchAttr(el, key, nextValue) {
      if (!nextValue) {
          el.removeAttribute(key);
      }
      else {
          el.setAttribute(key, nextValue);
      }
  }

  /**
   *
   * 1. 更新前有 更新后有 此时需要patch 也就是先从缓存中取出之前存的函数引用listenter 然后修改它的指向为新的value即可
   * 2. 更新前有 更新后无 此时删除缓存并且解绑dom事件
   * 3. 更新前无 更新后有 此时新增缓存且绑定dom事件
   *
   * @param el dom元素
   * @param key 事件名称 比如onclick
   * @param prevValue fn1
   * @param nextValue fn2
   */
  function patchEvent(el, key, prevValue, nextValue) {
      const invokers = el._vueEventInvokers || (el._vueEventInvokers = {});
      const existingInvoker = invokers[key];
      if (existingInvoker && nextValue) {
          // 更新绑定的函数
          existingInvoker.value = nextValue;
      }
      else {
          const eventName = key.slice(2).toLowerCase(); // 'click mouseenter scroll'
          if (nextValue) {
              // 如果新的dom上有key也有value 那么就说明新增一个事件
              let invoker = createInvoker(nextValue);
              invokers[key] = invoker; // 加入缓存
              el.addEventListener(eventName, invoker);
          }
          else {
              // 如果没有新值 那么移除之前
              el.removeEventListener(eventName, existingInvoker);
              invokers[key] = null; // 移除缓存
          }
      }
  }
  /**
   * 将用户绑定在事件上的函数包装成为一个匿名函数的调用 并用一个变量value保存它
   * 以便于后续直接取读取和改写这个函数的引用即可完成对事件函数的修改
   * 更新前：div @click="fn1"
   * 更新后：div @click="fn2"
   *
   * 1. 先移除fn1 然后新增绑定fn2
   * 2. 不能绑定两次 不会覆盖 会添加到事件队列中
   * 3. 用函数包装
   *
   * 更新前：div onClick="fn1"
   *        let listenter = (e)=>fn1(e);
   *        listenter.value = fn1
   *        div onClick="listenter"
   *
   *
   * 更新后：div onClick="fn2"
   *        listenter.value = fn2 只需要修改listenter的引用
   *        div onClick="listenter" 并不需要重新对dom进行解绑和重新绑定
   * @param listener
   * @returns
   */
  function createInvoker(listener) {
      const invoker = (e) => listener(e);
      invoker.value = listener;
      return invoker;
  }

  const nativeOnRE = /^on[a-z]/;
  /**
   * @description 包含一系列的属性更新操作
   */
  const patchProp = (el, key, prevValue, nextValue) => {
      switch (key) {
          case "class":
              patchClass(el, nextValue);
              break;
          case "style":
              patchStyle(el, prevValue, nextValue);
              break;
          default:
              // 如果是事件
              if (nativeOnRE.test(key)) {
                  patchEvent(el, key, prevValue, nextValue);
              }
              else {
                  // 如果是dom属性
                  patchAttr(el, key, nextValue);
              }
              // 如果是元素属性
              break;
      }
  };

  const objectToString = Object.prototype.toString;
  const toTypeString = (value) => objectToString.call(value);
  const hasOwnProperty = Object.hasOwnProperty;
  const isObject = (value) => {
      return typeof value === "object" && value !== null;
  };
  const isFunction = (value) => {
      return typeof value === "function";
  };
  const isArray = Array.isArray;
  const isString = (val) => toTypeString(val) === "[object String]";
  const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);
  /**
   * @description 判断传入的属性名是否是一个数字类型的字符串 比如'0' '1' '10'都符合 但是'-1' 'name' 'NaN'不符合
   * @param key
   * @returns
   */
  const isIntegerKey = (key) => isString(key) &&
      key !== "NaN" &&
      key[0] !== "-" &&
      "" + parseInt(key, 10) === key;

  /**
   * @description 响应式的核心实现effect函数
   * @param fn 回调函数
   *
   * 1. 默认会将传入的fn立即执行 如果是lazy 那么不会立即执行
   */
  function effect(fn, options = {}) {
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
  let activeEffect;
  // 栈结构主要是用于解决effect的嵌套执行 因为组件就是嵌套的
  const effectStack = [];
  /**
   * @description 创建一个effect副作用函数并返回 执行这个effect函数可以添加对内部响应式数据的主动观测
   * @param fn
   * @param options
   * @returns
   */
  function createReactiveEffect(fn, options) {
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
              }
              finally {
                  effectStack.pop();
                  activeEffect = effectStack[effectStack.length - 1];
              }
          }
      };
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
  function track(target, type, key) {
      // debugger;
      if (activeEffect === undefined)
          return;
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
      console.log("依赖收集完成一次，当前的targetMap是 === > ", "\r\n", target, "\r\n", key, "\r\n", targetMap);
  }
  /**
   * @description 属性的更新通知
   * @param target
   * @param type
   * @param key
   * @param newValue
   * @param oldValue
   */
  function trigger(target, type, key, newValue, oldValue) {
      // debugger;
      let depsMap = targetMap.get(target);
      // 如果在weakMap依赖收集集合中找不到这个对象 说明没有被收集 那么不用更新
      if (!depsMap)
          return;
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
      }
      else {
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
              case "add" /* ADD */:
                  if (isArray(target) && isIntegerKey(key)) {
                      add(depsMap.get("length"));
                  }
                  break;
          }
      }
      // 触发更新 也就是取出当前属性key的每一个effect然后执行 再次更新的时候会重新去依赖收集触发getter并拿到更新后的值
      // 在页面上的表现就是视图上绑定的依赖属性都发生了变化
      effects.forEach((effect) => {
          if (effect.options.scheduler) {
              effect.options.scheduler(effect);
          }
          else {
              effect();
          }
      });
  }

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
  /**
   * @description 创建一个get拦截函数并返回 依赖收集在此发生
   * @param isReadonly 是否只读
   * @param shallow 是否为浅劫持
   */
  function createGetter(isReadonly = false, shallow = false) {
      return function get(target, key, receiver) {
          if (key === "__v_raw" /* RAW */ &&
              receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)) {
              return target;
          }
          const result = Reflect.get(target, key, receiver);
          // 如果不是只读的 进行依赖收集
          if (!isReadonly) {
              track(target, "get" /* GET */, key);
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
          const isExistKey = isArray(target) && isIntegerKey(key)
              ? Number(key) < target.length
              : hasOwn(target, key);
          // 获取设置后的返回值用于setter方法的返回值
          const res = Reflect.set(target, key, value, receiver);
          if (!isExistKey) {
              // 走新增的更新
              trigger(target, "add" /* ADD */, key, value);
          }
          else if (oldValue !== value) {
              // 走修改的更新
              trigger(target, "set" /* SET */, key, value);
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
  const mutableHandlers = {
      get,
      set,
  };
  const shallowReactiveHandlers = {
      get: shallowGet,
      set: shallowSet,
  };
  const readonlyHandlers = {
      get: readonlyGet,
      set: (target, key) => {
          console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
          return true;
      },
  };
  const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
      get: shallowReadonlyGet,
  });

  function reactive(target) {
      return createReactiveObject(target, false, mutableHandlers);
  }
  function shallowReactive(target) {
      return createReactiveObject(target, false, shallowReactiveHandlers);
  }
  function readonly(target) {
      return createReactiveObject(target, true, readonlyHandlers);
  }
  function shallowReadonly(target) {
      return createReactiveObject(target, true, shallowReadonlyHandlers);
  }
  // 存放响应代理的缓存 以target为key 以代理对象proxy为value
  const reactiveMap = new WeakMap();
  // 存放只读代理的缓存
  const readonlyMap = new WeakMap();
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

  /**
   * 将普通类型转化为一个对象
   * 这个对象有value属性指向原来的原始值
   * name.value
   * name.value = xxx;
   *
   */
  /**
   * @description 如果rawValue是一个对象 将其转化为响应式的对象后返回
   * @param rawValue 用户调用ref()时传入的值 可能是对象可能是基本值
   * @returns
   */
  function convert(rawValue) {
      if (isObject(rawValue)) {
          return reactive(rawValue);
      }
      else {
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
  function ref(value) {
      return createRef(value);
  }
  function shallowRef(value) {
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
      /**
       *
       * @param rawValue 永远暴露的是未被代理过的值
       * @param shallow 是否浅劫持
       */
      constructor(rawValue, shallow) {
          this.rawValue = rawValue;
          this.shallow = shallow;
          this.__v_isRef = true; // 标识是否为一个RefImpl实例
          // 如果是浅劫持 就直接赋值即可 否则需要将每一层都转化为响应式的值
          this._value = shallow ? rawValue : convert(rawValue);
      }
      /**
       * @description 外部执行 state.value 进行依赖收集
       */
      get value() {
          track(this, "get" /* GET */, "value");
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
              trigger(this, "set" /* SET */, "value", newValue);
          }
      }
  }
  function isRef(target) {
      return Boolean((target === null || target === void 0 ? void 0 : target.__v_isRef) === true);
  }
  /**
   *
   * @description 将target对象的key属性转换为一个Ref实例并返回 返回的ref和源对象target保持同步更改
   * 将targte[key]的访问形式 转化为 属性访问器.value的形式
   * @param target
   * @param key
   */
  function toRef(target, key) {
      if (isRef(target[key])) {
          return target[key];
      }
      else {
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
  function toRefs(target) {
      const ret = Array.isArray(target) ? [] : {};
      for (const key in target) {
          ret[key] = toRef(target, key);
      }
      return ret;
  }
  class ObjectRefImpl {
      constructor(target, key) {
          this.target = target;
          this.key = key;
          this.__v_isRef = true;
      }
      get value() {
          return this.target[this.key];
      }
      set value(newValue) {
          this.target[this.key] = newValue;
      }
  }
  function unref(ref) {
      return isRef(ref) ? ref.value : ref;
  }

  function computed(getterOrOptions) {
      let getter;
      let setter;
      if (isFunction(getterOrOptions)) {
          getter = getterOrOptions;
          setter = () => { };
      }
      else {
          getter = getterOrOptions.get || (() => { });
          setter = getterOrOptions.set || (() => { });
      }
      // 创建一个计算属性的实例
      return new ComputedRefImpl(getter, setter);
  }
  class ComputedRefImpl {
      constructor(getter, setter) {
          this.setter = setter;
          this._dirty = true;
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
                  trigger(this, "set" /* SET */, "value");
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
          track(this, "get" /* GET */, "value");
          // 然后将值返回
          return this._value;
      }
      //   计算属性不需要主动更新setter
      set value(newValue) {
          this.setter(newValue);
      }
  }

  /**
   * @description Vue3.0官方文档对于createVNode的描述
   *
   * 1. createVNode函数专门用来创建虚拟节点 但是它还有另外一个名字那就是h函数
   * 2. h() 是 hyperscript 的简称——意思是“能生成 HTML (超文本标记语言) 的 JavaScript”。这个名字来源于许多虚拟 DOM 实现默认形成的约定。
   * 3. h函数的参数非常灵活：
   *  + 第一个参数可以是一个html标签字符串 也可以是一个component对象
   *  + 第二个参数是要传递的 prop
   *  + 第三个参数是子节点
   *  + 当创建一个组件的 vnode 时，子节点必须以插槽函数进行传递。+
   *  + 当子节点不是插槽对象时，可以省略 prop 参数。
   *  + 如果组件只有默认槽，可以使用单个插槽函数进行传递。否则，必须以插槽函数的对象形式来传递。
   *
   *
   * @param type {string | Component}  代表类型可以是组件对象或者原生html元素的字符串
   * @param props 属性对象
   * @param children 子节点 可能是字符串或者vNode
   */
  function createVNode(type, props = {}, children = null) {
      /* 给虚拟节点打上类型标记 */
      let shapeFlag;
      if (isString(type)) {
          shapeFlag = 1 /* ELEMENT */; // HTML元素 1
      }
      else if (isObject(type)) {
          shapeFlag = 4 /* STATEFUL_COMPONENT */; // 普通组件 4
      }
      else if (isFunction(type)) {
          shapeFlag = 2 /* FUNCTIONAL_COMPONENT */; // 函数组件 2
      }
      else {
          shapeFlag = 0;
      }
      /**
       * 核心的虚拟DOM节点 本质就是用js对象来描述一个UI节点
       * 好处1：是具有跨平台的能力 不限于浏览器 node中也可以体验到vue-runtime-core的能力
       * 好处2：可以在更新时进行patch 只更新变化的节点 减少dom操作
       */
      const vnode = {
          __v_isVNode: true,
          key: props && props.key,
          type,
          props,
          children,
          component: null,
          el: null,
          shapeFlag,
      };
      normalizeChildren(vnode, children);
      return vnode;
  }
  /**
   * @description 基于当前的虚拟节点是否有children子节点来修正虚拟节点的类型
   * 比如vnode是一个组件类型 但是由于有了子节点 应该是一个带有子节点的组件类型
   * @param vnode
   * @param children
   */
  function normalizeChildren(vnode, children) {
      let type = 0;
      if (children == null) ;
      else if (isArray(children)) {
          type = 16 /* ARRAY_CHILDREN */;
      }
      else {
          type = 8 /* TEXT_CHILDREN */;
      }
      /**
       * 进行或运算 可以得出自己的类型和儿子的类型 比如：
       * 00000010 | 00010000 => 00010010
       * 自己的类型是一个元素element
       * 儿子的类型是一个文本节点还是一个数组组成的节点
       */
      vnode.shapeFlag = vnode.shapeFlag | type;
  }
  function isVNode(value) {
      return value ? value.__v_isVNode === true : false;
  }
  function normalizeVNode(child) {
      // 说明本身就是用h函数创建出来的虚拟节点 直接返回即可
      if (isObject(child)) {
          return child;
      }
      else {
          // 说明是文本节点 type, props children
          return createVNode(Text, null, String(child));
      }
  }
  const Text = Symbol("Text");

  function createAppContext() {
      return {
          app: null,
          config: {
              globalProperties: {},
              isNativeTag: false,
              isCustomElement: false,
              errorHandler: undefined,
              warnHandler: undefined,
          },
          mixins: [],
          components: {},
          directives: {},
          provides: Object.create(null),
      };
  }
  /**
   * @description 基于传入的render函数 返回一个用来创建App应用的函数createApp
   * @param render 用户传入的render函数 会在mount阶段被调用
   * @returns {Function} createApp
   */
  let uid$1 = 0;
  function createAppAPI(render) {
      return function createApp(rootComponent, roopProps) {
          const context = createAppContext();
          const app = (context.app = {
              // 高阶函数应用：在这里可以获取所有的参数 rendererOptions  rootComponent roopProps container
              _uid: uid$1++,
              _component: rootComponent,
              _props: roopProps,
              _container: null,
              _context: context,
              mount(container) {
                  // debugger;
                  // 基于rootComponent组件对象创建虚拟节点 createVNode
                  const vNode = createVNode(rootComponent, roopProps);
                  // 调用render方法 将返回的虚拟vNode转化成真实dom 挂载到container
                  render(vNode, container);
                  // 给app属性标记_container 便于后续
                  app._container = container;
              },
              unmount() { },
              use(plugin, ...options) { },
              mixin(componentOptions) { },
              component(name, component) { },
              directive(name, directive) { },
              provide(key, value) { },
          });
          return app;
      };
  }

  /**
   * 这个porxy handlers主要就是拦截用户在render函数内部去proxy上取props、data、setupState的取值和存值行为
   *
   *  比如你的组件定义了一个state在setup中返回了 然后还定义了data和props等
   *  那么如何让用户在render函数内部直接用proxy.name可以去instance的props、setupState和data上取值
   *  就要通过代理来实现：proyx.name => instance.state.name
   */
  const PublicInstanceProxyHandlers = {
      /**
       *
       * @param target   target = instance.ctx = { _: instance };
       * @param key
       *
       * instance.ctx这个对象传递给render函数，会被参数proxy接受
       * render函数内部用户会去proxy上取props、data、setupState也就是setup函数的返回值是一个对象的时候
       * 比如：proxy.props.name
       */
      get({ _: instance }, key) {
          // 如果属性名以$开头 那么直接返回undefined
          if (key[0] === "$") {
              return undefined;
          }
          const { props, setupState, data } = instance;
          if (hasOwn(setupState, key)) {
              return setupState[key];
          }
          else if (hasOwn(props, key)) {
              return props[key];
          }
          else if (hasOwn(data, key)) {
              return data[key];
          }
          else {
              return undefined;
          }
      },
      set({ _: instance }, key, value) {
          const { props, setupState, data } = instance;
          if (hasOwn(setupState, key)) {
              setupState[key] = value;
          }
          else if (hasOwn(props, key)) {
              props[key] = value;
          }
          else if (hasOwn(data, key)) {
              data[key] = value;
          }
          return true;
      },
  };

  /**
   * @description 基于组件的虚拟dom创建一个组件实例instance
   * @param vnode 组件的vNode
   * @returns
   *
   * 补充：组件的props和attrs分别代表什么?
   *
   * 父组件中使用：
   * <header name="lilei" age="18" isShow="flase"></header>
   *
   * 子组件header内部的只接受了name和age，那么：
   * 子组件的props = {name,age}
   * 子组件的attrs = {isShow} 所有没有被props接受的属性集合都时attrs
   *
   * @description instance 包含一系列组件状态的js对象 比如props\setupState\attrs\slots等
   * @description context Vue内部将一些常用的属性和对象从instance中抽离出来 通过setup参数传递给用户使用
   * @description proxy 专门来代理访问instance的代理对象 让用户在render函数中更加方便取值
   */
  let uid$2 = 0;
  function createComponentInstance(vnode) {
      const instance = {
          uid: uid$2++,
          vnode,
          ctx: {},
          type: vnode.type,
          props: {},
          attrs: {},
          slots: {},
          data: {},
          setupState: {},
          setupContext: null,
          render: null,
          isMounted: false,
          proxy: null,
          update: null,
          subTree: null,
      };
      instance.ctx = { _: instance };
      return instance;
  }
  /**
   * @description 解析组件实例instance 将需要的数据解析然后挂载到实例instance上
   * @param instance
   */
  function setupComponent(instance) {
      const vnode = instance.vnode;
      const { props, children, shapeFlag } = vnode;
      // 基于虚拟节点vnode中得到的props, children 解析之后放到组件实例instance上
      instance.props = props; // initProps
      instance.children = children; // initSlots
      // 判断是普通组件还是函数式组件
      const isStateful = shapeFlag & 4 /* STATEFUL_COMPONENT */;
      // 如果有状态调用当前组件实例的render/setup方法 用返回值来填充instance上的setupState属性和render方法
      const setupResult = isStateful ? setupStatefulComponent(instance) : undefined;
      // 将setup函数执行的结果返回
      return setupResult;
  }
  function setupStatefulComponent(instance) {
      // 1. 代理 不用instance.props.xxx instance.data.xxx 去访问
      instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
      // 2. 拿到传入的组件对象 并获取到用户写的setup函数
      const Component = instance.type;
      let { setup } = Component;
      if (setup) {
          //   创建setup在执行时的参数props和context 只有当用户传入的setup函数的参数大于1时才需要
          const setupContext = setup.length > 1 ? createSetupContext(instance) : null;
          instance.setupContext = setupContext;
          /**
           * 将instance上很多属性中提取一些常用的属性和方法传递给setup的第二个参数context
           * 通过参数暴露出来供用户直接调用
           * 所以组件的实例instance和组件的context是不同的 后者基于前者得到 是一个子集
           */
          const setupResult = setup(instance.props, instance.setupContext);
          handleSetupResult(instance, setupResult);
      }
      else {
          /**
           * 如果传入的组件对象上有render函数 那么还需要执行render函数
           * render函数的参数proxy是一个代理了组件的instance实例对象的代理对象
           * 用户去proxy上取值 就会被拦截代理到去instance上的props data setupState上取值
           */
          finishComponentSetup(instance);
      }
  }
  /**
   * @description 基于setup函数执行返回值(render函数|对象)进行处理
   * @param instance
   * @param setupResult
   */
  function handleSetupResult(instance, setupResult) {
      // 返回值是函数 那么这个函数就被当做实例的render函数
      if (isFunction(setupResult)) {
          instance.render = setupResult;
      }
      else if (isObject(setupResult)) {
          // 返回值是对象 那么这个函数就被当做实例的setupState
          instance.setupState = setupResult;
      }
      // 组件初始化完成
      finishComponentSetup(instance);
  }
  /**
   * @description render函数优先级问题
   * 1. setup返回值是一个函数 那么优先使用
   * 2. 其次是用户自己传递的render函数
   * 3. 最后才是用户传入的模板template编译的结果
   * @param instance
   */
  function finishComponentSetup(instance) {
      const Component = instance.type;
      /**
       * 1. render函数的来源是多元的 这一步首先确定render函数
       * 实例上没有render函数 说明setup没有返回render函数
       * 此时如果Component对象用户传递了render函数 那么自己用
       * 此时如果Component对象用户没有传递render函数并且有模板 那么去进行模板编译生成一个render函数
       */
      if (!instance.render) {
          if (Component.template && !Component.render) ;
          // 情况1:用户自己传递了Component.render函数 此时用用户自己的
          // 情况2：用户没有传递模板 并且没有传递render函数 此时给一个空函数() => {}
          instance.render = Component.render || (() => { });
      }
      /**
       * 2. Vue2.0 选项式API的兼容applyOptions
       */
      // applyOptions(instance, Component)
  }
  function createSetupContext(instance) {
      return {
          props: instance.props,
          attrs: instance.attrs,
          slots: instance.slots,
          emit: () => { },
          expose: () => { },
      };
  }

  let quene = [];
  /**
   * @description 将job进行去重之后推入到一个队列上
   * 避免连续更新三次相同的age 不需要连续执行三次age对应的effect执行
   *  state.age = 20;
   *  state.age = 20;
   *  state.age = 20;
   *
   * @param job 其实就是组件的effect函数 执行effect函数内部会执行render函数 重新取值进行渲染
   */
  function queneJob(job) {
      console.log("调度器执行");
      if (!quene.includes(job)) {
          quene.push(job);
          queueFlush();
      }
  }
  let isFlushPending = false;
  /**
   * @description 通过哨兵变量和浏览器的eventLoop机制来实现的队列刷新
   * 等待当前轮循环的所有执行栈的任务执行完毕 然后执行微任务Promise.resolve().then
   * 好处是同一轮事件循环中 无论quenejob执行了N次
   * 保证flushJobs只执行一次
   *
   * 避免了：
   * state.age = 100;
   * state.name = 'xx';
   * state.xx = 50
   *
   * 这种同一轮事件循环中连续执行三次effect去更新同一组件的问题
   */
  function queueFlush() {
      if (!isFlushPending) {
          isFlushPending = true;
          Promise.resolve().then(flushJobs);
      }
  }
  /**
   * @description 刷新队列 就是将队列中每一job取出来执行 但是在执行前需要排序
   * 1. 保证先刷新父组件的effect 后刷新子组件的effect
   *    因为effect的id总是父亲小于儿子
   *    避免子组件刷新完了 又修改了父组件 导致父组件重新刷新
   *
   * 2. 如果在父组件执行effect更新期间子组件已经被卸载了 那么可以跳过子组件的effect执行
   */
  function flushJobs() {
      isFlushPending = false;
      quene.sort((a, b) => a.id - b.id);
      for (const job of quene) {
          job();
      }
      quene.length = 0;
  }

  /**
   * runtime-core提供和平台无关的创建不同的渲染器的方法
   * 创建渲染器的核心是提供一个render函数
   * 只需要告诉这个render函数把那些 VNode渲染到那个真实dom节点上即可
   * 1. weex
   * 2. web
   * 3. ssr
   * @description 传入不同的RendererOptions 返回不同的渲染器
   * @param rendererOptions 渲染选项 主要是包含一个当前平台的对节点以及属性操作的api接口组成对象
   * @returns renderer 返回一个渲染器 其实就是一个app对象 上面有一系列方法如mount
   */
  function createRenderer(rendererOptions) {
      const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, setText: hostSetText, setElementText: hostSetElementText, } = rendererOptions;
      /**
       * @description runtime-core的核心 基于不同的虚拟节点创建不同的真实dom元素
       *
       * 1. 将虚拟dom转化为真实DOM
       * 2. 将真实DOM挂载到container山
       * 3. 虚拟DOM转化为真实DOM的过程中会有patch操作
       * @param vNode 虚拟DOM
       * @param container 真实DOM节点
       */
      const render = function (vNode, container) {
          console.log({
              vNode,
              container,
          });
          patch(container._vnode || null, vNode, container);
          container._vnode = vNode;
      };
      /**
       * @description 更新和挂载的核心流程
       * @param oldVNode
       * @param newVNode
       * @param container
       */
      const patch = function (oldVNode, newVNode, container) {
          /**
           * 针对传入的不同虚拟节点做初始化操作
           * 基于二进制的按位与来判断传入的虚拟节点类型 要比写if-else好很多
           * 因为拿未知的节点类型和目标节点类型按位与 如果返回有值 那么肯定相等
           * 否则按位与会返回0
           *
           * 00000001
           * 00000010
           * 00000100
           * 00001000
           * 00010000
           * 00100000
           * 01000000
           * 10000000
           *
           * 比如元素类型ELEMENT00000001只有在和自己进行按位与才会返回true 和上述其他类型按位与都会返回0
           */
          const { shapeFlag, type } = newVNode;
          switch (type) {
              case Text:
                  processText(oldVNode, newVNode, container);
                  break;
              default:
                  if (shapeFlag & 1 /* ELEMENT */) {
                      console.log("这是一个HTML元素的虚拟DOM节点", newVNode);
                      processElement(oldVNode, newVNode, container);
                  }
                  else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                      console.log("这是一个普通有状态组件的虚拟DOM节点");
                      processComponent(oldVNode, newVNode, container);
                  }
                  else if (shapeFlag & 2 /* FUNCTIONAL_COMPONENT */) {
                      console.log("这是一个函数式组件的虚拟DOM节点");
                      processComponent(oldVNode, newVNode, container);
                  }
          }
      };
      const processText = function (oldVNode, newVNode, container) {
          // 将文本插入到container中
          if (oldVNode == null) {
              // 先基于newVNode创建出来一个dom文本节点
              newVNode.el = hostCreateText(newVNode.children);
              // 再将dom文本节点插入到el节点中 dom操作必须操作dom元素
              hostInsert(newVNode.el, container);
          }
      };
      const processElement = function (oldVNode, newVNode, container) {
          if (oldVNode == null) {
              // 元素挂载
              mountElement(newVNode, container);
          }
      };
      const mountElement = function (vnode, container) {
          const { type, props, shapeFlag, children } = vnode;
          // 创建真实el和虚拟vnode产生连接
          const el = hostCreateElement(type);
          vnode.el = el;
          // 给元素添加props和attrs以及style属性 以及绑定事件
          if (props) {
              for (const key in props) {
                  // el, key, prevValue, nextValue
                  hostPatchProp(el, key, null, props[key]);
              }
          }
          // 给元素添加子节点 可能是一个文本节点或者一个数组里的多个节点
          if (shapeFlag & 8 /* TEXT_CHILDREN */) {
              hostSetElementText(el, children);
          }
          else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
              mountChildren(children, el);
          }
          // 将创建出来的el插入到container中 child, parent, anchor
          hostInsert(el, container);
      };
      const mountChildren = function (children, container) {
          for (let index = 0; index < children.length; index++) {
              /**
               * 创建出每一个儿子节点对应的虚拟vNode 交给patch挂载或者渲染
               * 为什么要这样做？
               * 因为如果直接操作真实dom 会出现连续插入两次text文本的操作 后面的会覆盖前面的
               */
              const child = normalizeVNode(children[index]);
              // console.log({ child });
              //  递归渲染
              patch(null, child, container);
          }
      };
      const processComponent = function (oldVNode, newVNode, container) {
          // 第一次挂载
          if (oldVNode == null) {
              mountComponent(newVNode, container);
          }
      };
      /**
       * 组件的渲染流程
       * 1. 调用setup拿到返回值
       * 2. 获取render函数返回的结果
       * 3. 进行渲染
       * @param initialVNode
       * @param container
       */
      const mountComponent = function (initialVNode, container) {
          // 1.基于虚拟节点创建组件实例
          const instance = createComponentInstance(initialVNode);
          // 通过虚拟vnode.component可以获取到解析后的组件实例 反之通过组件实例instance的vnode属性也可以获取虚拟节点
          initialVNode.component = instance;
          // 2. 将需要的数据解析然后挂载到实例上
          setupComponent(instance);
          // 3. 创建一个effect 让render函数执行
          setupRenderEffect(instance, initialVNode, container);
      };
      /**
       * @description 创建一个effect函数 在effect内部调用render函数
       * 这样render函数中使用的数据就会收集这个effect
       * 当数据发生变化的时候 就会重新执行effect 也就是重新调用render函数重新渲染
       * @param instance
       * @param initialVNode
       * @param container
       */
      const setupRenderEffect = function (instance, initialVNode, container) {
          // 每个组件都有一个effect vue3是组件级更新 数据更新会重新执行对应组件的effect
          instance.update = effect(function componentEffect() {
              // 首次渲染组件
              if (!instance.isMounted) {
                  // proxyToUse就是{ _: instance }这个target对象的代理对象
                  let proxyToUse = instance.proxy;
                  /**
                   * 执行render函数
                   * 第一个proxyToUse代表指定render函数内部的this
                   * 第二个proxyToUse代表render函数执行时可接收到的参数对象 取值和设值都会代理
                   *
                   *  第一步：将用户传入的rootComponent变成vNode 描述组件本身
                   *  此时vNode的type就是用户传入的对象{render，setup}
                   *  vNode = createVNode(rootComponent, roopProps)
                   *
                   *
                   *  第二步：将vNode和container传入render函数进行渲染
                   *  此时subTree的type就是一个具体的节点h1 div等 表示这个组件的根节点渲染出来就是div
                   *  subTree = render(vNode, container);
                   *  render函数的返回值subTree是执行组件render函数的虚拟节点树对象
                   *
                   *  这是一个父子关系
                   *  执行insatnce的render函数就会实现依赖收集
                   */
                  const subTree = instance.render.call(proxyToUse, proxyToUse);
                  patch(null, subTree, container);
                  instance.subTree = subTree;
                  instance.isMounted = true;
              }
              else {
                  // 更新组件逻辑
                  console.log("更新组件");
              }
          }, {
              // 调度器会优先执行 不会再去执行effect也就是这里的componentEffect函数
              // 调度器函数执行的时候会将componentEffect本身当做参数传递过去
              scheduler: queneJob,
          });
      };
      const createApp = createAppAPI(render);
      /**
       * Vue的自定义渲染器创建函数
       * 接受一个渲染对象rendererOptions
       * 返回一个包含createApp函数和render函数的对象renderer
       *
       * 用户可以从renderer上拿到createApp函数并传入一个组件对象rootComponent和roopProps
       * 返回一个根组件实例app
       * 接着用户可以调用这个根组件实例app上的:
       * + use方法去注册插件 如ElementPlus
       * + component方法去注册组件
       * + provide去顶级注入
       * + directive去注册指令
       * + mixins来实现全局混入
       * + mount方法实现挂载 一般这是最后一步 在调用mount的时候会再内部调用传入的render函数 render函数内部会有挂载和patch操作
       * + unmount来卸载
       */
      return {
          createApp: createApp,
          render: render,
      };
  }

  /**
   * @description h函数多出现在render函数中 是createVnode的简写 但是它比createVnode更加灵活
   * @description 正是因为这种参数灵活 我们才需要进行一次统一的格式化然后交给createVnode执行
   * @param type
   * @param propsOrChildren
   * @param children
   * @returns
   */
  function h(type, propsOrChildren, children) {
      console.log({
          type,
          propsOrChildren,
          children,
      });
      const l = arguments.length;
      /**
       * 1. h函数的第一位参数是必传的
       * 2. h函数可以省略第二个参数，并且可以进行嵌套
       *
       * l = 2那么说明另外一位参数要不是props 要不是children
       *
       * 1. 当参数是对象并且不是数组，此时有两种情况
       *    + 对象是props
       *     h('div',{name:'lilei'})
       *    + 对象是嵌套的h函数返回值也就是虚拟vnode
       *     h('div',h('p'))
       *        此时应该将 嵌套的h函数返回值的虚拟节点对象当前children传入
       *        注意h函数的返回值只能当做children 并且包装在数组里面
       *
       * 2. 否则那么就是下面两种情况：
       *    + 传递的是一个字符串   h('div',’666‘)
       *    + 传递的是一个数组  h(div,[hello,h(span)])
       *    以上两种情况都可以直接当做第三个参数传递过去即可
       */
      if (l === 2) {
          if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
              if (isVNode(propsOrChildren)) {
                  return createVNode(type, null, [propsOrChildren]);
              }
              else {
                  return createVNode(type, propsOrChildren);
              }
          }
          else {
              return createVNode(type, null, propsOrChildren);
          }
      }
      else {
          /**
           * 长度大于3：说明从第三个开始全部都是children 必须以数组包裹
           * 长度等于3：
           *  + 最后一个参数是虚拟节点 也就是h函数返回值 此时包装为数组当做children
           *  + 最后一个参数是字符串
           */
          if (l > 3) {
              children = Array.from(arguments).slice(2);
          }
          else if (l === 3 && isVNode(children)) {
              children = [children];
          }
          return createVNode(type, propsOrChildren, children);
      }
  }

  /**
   * runtime-dom的核心是向外部暴露DOM Api
   * 1. 操作节点的api 专注于增删改查
   * 2. 操作属性的api 专注于添加 删除 更新
   *  + 样式
   *  + 类名
   *  + 事件
   *  + 其他属性
   *
   * runtime-dom重点是为了解决浏览器平台的差异 并不直接面向用户 供runtime-core调用
   * runtime-core是直接面向用户的 用户会直接调用这里的方法
   */
  // 将操作dom节点和更新属性、事件、style、class等方法进行合并
  const rendererOptions = Object.assign({}, nodeOps, { patchProp });
  const createApp = function (rootComponent, roopProps = null) {
      // 1. 创建渲染器 createRenderer是runtime-core的核心
      const renderer = createRenderer(rendererOptions);
      // 2. 基于渲染器创建App实例
      const app = renderer.createApp(rootComponent, roopProps);
      // 获取渲染器给的mount方法
      let { mount } = app;
      /**
       * 这里对mount进行重写 为什么？
       * 1. 这里需要再挂载之前清空dom 这是dom操作 而渲染器内部提供的方法是可以在多平台使用的
       * 不应该包含任何dom操作
       * 2. 切片函数
       *
       */
      app.mount = function (container) {
          // 渲染之前清空容器 这里为用户提供了自定义的空间 比如是canvas的画布 这里就可以执行canvas的清空画布的api
          container = document.querySelector(container);
          container.innerHTML = "";
          // 外部执行的挂载的时候用的还是渲染器给的方法 但是这里有个切片的技巧
          // 就是在执行渲染器的mount之前 可以插入当前平台自己的逻辑
          // web平台可能是document.querySelector 在别的平台很可能就不是了
          mount(container);
      };
      // 3. 将创建好的app实例返回 上面有mount方法
      return app;
  };

  exports.computed = computed;
  exports.createApp = createApp;
  exports.createAppAPI = createAppAPI;
  exports.createRenderer = createRenderer;
  exports.effect = effect;
  exports.h = h;
  exports.isRef = isRef;
  exports.reactive = reactive;
  exports.readonly = readonly;
  exports.ref = ref;
  exports.shallowReactive = shallowReactive;
  exports.shallowReadonly = shallowReadonly;
  exports.shallowRef = shallowRef;
  exports.toRef = toRef;
  exports.toRefs = toRefs;
  exports.track = track;
  exports.trigger = trigger;
  exports.unref = unref;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
//# sourceMappingURL=runtime-dom.global.js.map
