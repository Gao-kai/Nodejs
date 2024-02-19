import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  isReactive,
  isRef,
  reactive,
  toRefs,
  watch,
} from "vue";
import { piniaSymbol } from "./rootStore";
import { addSubscription, triggerSubscriptions } from "./subscribe";
import { activePinia, setActivePinia } from "./createPinia";

/* 
    defineStore(id,options)
    defineStore(options)
    defineStore(id,setupFn) 
*/
export function defineStore(idOrOptions, setup) {
  let id;
  let options;
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = setup;
  } else {
    id = idOrOptions.id;
    options = idOrOptions;
  }

  // setup可能是一个函数

  const isSetupStore = typeof setup === "function";

  function useStore() {
    let instance = getCurrentInstance();
    let pinia = instance && inject(piniaSymbol);
    /* 如果是在组件中加载 那么就设置一次 */
    if (pinia) {
      setActivePinia(pinia);
    }
    // 否则这里就取全局变量上那个createPinia时的pinia
    pinia = activePinia;
    if (!pinia._s.has(id)) {
      // 创建一个新的
      if (isSetupStore) {
        createSetupStore(id, setup, pinia);
      } else {
        createOptionStore(id, options, pinia);
      }
    }

    // 直接从缓存取回
    const store = pinia._s.get(id);
    return store;
  }

  return useStore;
}

function createSetupStore(id, setup, pinia, isOption) {
  //   这个store主要用于存放内置的api 以及绑定this会用到
  let actionSubscriptions = [];
  const partialState = {
    $patch,
    $subscribe,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $dispose() {
      scope.stop();
      actionSubscriptions = [];
      pinia._s.delete(id);
    },
  };

  function $subscribe(callback, options = {}) {
    scope.run(() => {
      // 直接给 watch() 传入一个响应式对象，会隐式地创建一个深层侦听器——该回调函数在所有嵌套的变更时都会被触发：
      watch(
        pinia.state.value[id],
        (newState) => {
          callback({ storeId: id }, newState);
        },
        options
      );
    });
  }
  /* 
    核心api之patch方法的实现
  */
  function $patch(partialStateOrMutator) {
    let prevState = pinia.state.value[id];
    if (typeof partialStateOrMutator === "object") {
      // 那么这里就是新老状态的合并 用法如store.$patch({state:200})
      mergeReactiveObject(prevState, partialStateOrMutator);
    } else if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(prevState);
    }
  }

  function mergeReactiveObject(target, state) {
    for (const key in state) {
      let oldValue = target[key];
      let newValue = state[key];
      if (isObject(oldValue) && isObject(newValue)) {
        target[key] = mergeReactiveObject(oldValue, newValue);
      } else {
        target[key] = newValue;
      }
    }

    return target;
  }

  function isObject(v) {
    return (
      typeof v === "object" &&
      v !== null &&
      Object.prototype.toString.call(v) === "[object Object]" &&
      typeof v.toJSON !== "function"
    );
  }

  const initialState = pinia.state.value[id];
  // setup的选项无法直接获取到状态
  if (!initialState && !isOption) {
    pinia.state.value[id] = {};
  }

  //   这个scope是当前store可以停止自己的钥匙
  let scope;
  let piniaScope = pinia._e;
  //   外面包一层的意义在于可以直接调用piniaScope.stop停止所有store的响应式
  //   piniaScope.run返回值就是回调函数的返回值
  // 也就是scope.run(() => setup())的返回值
  // scope.run(() => setup())的返回值不就是setup()函数执行的结果吗
  //   这个setupStore主要用于存放用户传入的业务逻辑中的state action以及getters
  const setupStore = piniaScope.run(() => {
    scope = effectScope();
    return scope.run(() => setup());
  });

  const store = reactive(partialState);
  store.$id = id;
  pinia._s.set(id, store);

  function wrapAction(name, action) {
    return (...args) => {
      const afterCbList = [];
      const onErrorCbList = [];

      // 触发订阅
      function after(callback) {
        afterCbList.push(callback);
      }

      function onError(callback) {
        onErrorCbList.push(callback);
      }

      triggerSubscriptions(actionSubscriptions, { after, onError });

      let ret;
      try {
        // ret可能是一个promise
        ret = action.apply(store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCbList, error);
      }

      if (ret instanceof Promise) {
        // 一来返回ps 二来中止函数执行
        return ret
          .then((res) => {
            triggerSubscriptions(afterCbList, res);
          })
          .catch((err) => {
            triggerSubscriptions(onErrorCbList, err);
            return Promise.reject(e);
          });
      }
      triggerSubscriptions(afterCbList, ret);
      return ret;
    };
  }

  for (const key in setupStore) {
    // 这里如果是计算属性并不会触发getter
    let prop = setupStore[key];
    if (typeof prop === "function") {
      // 对action中的this和后续逻辑进行处理 函数劫持
      setupStore[key] = wrapAction(key, prop);
    }

    // 如何判断一个值是不是响应时状态
    // ref是状态 reactive也是 但是isRef传入一个计算书想也会返回true
    // 所以得是ref并且不是computed 才是真正要维护的状态
    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      if (!isOption) {
        pinia.state.value[id][key] = prop;
      }
    }
  }

  console.log(pinia.state.value);

  //   最终将两者合并 合并后的store既有内置的pinia api 也有用户传递的内容
  Object.assign(store, setupStore);

  Object.defineProperty(store, "$state", {
    get() {
      return pinia.state.value[id];
    },
    set(newState) {
      store.$patch((prevState) => {
        Object.assign(prevState, newState);
      });
    },
  });

  pinia._p.forEach((plugin) => {
    scope.run(() => {
      Object.assign(
        store,
        // 将插件的返回值当作store的属性
        scope.run(() => {
          return plugin({ store, pinia });
        })
      );
    });
  });

  return store;
}

function isComputed(v) {
  return !!(isRef(v) && v.effect);
}

function createOptionStore(id, options, pinia) {
  const { state, actions, getters } = options;
  // 所有用户传递给当前store的state action或者getters都会包在一起
  // 方便后期全部停止响应式服务

  /* 
    链式赋值 左侧的变量得到的是一个普通对象 最终合并得到的就是一个普通对象
    分开赋值 左侧的变量得到的是一个响应式对象
  */

  const setup = () => {
    // 选项式的写法可以保证pinia.state的值就是用户传入的state方法的返回值 但是setup写法的如何保证呢？
    let localState = (pinia.state.value[id] = state ? state() : {});
    // 因为用户options写法传入进来的是一个普通对象 后续组件内部patch修改这个普通对象的属性并不会引起响应式更新
    // 所以需要toRefs来转化以下
    // 如果直接这样写pinia.state.value[id] 那么合并之后的getters中的computed的dirty都是false 会立即执行一次getter
    // 导致this都没有绑定好就报错了 因为代码压根走不到pinia._s.set(id)的地方
    // 那如果我先set呢？
    localState = toRefs(pinia.state.value[id]);
    const getterKeys = Object.keys(getters || {});
    const localGetters = getterKeys.reduce((memo, getterKey) => {
      memo[getterKey] = computed(() => {
        // 问题的核心在于这里没有取到store
        let store = pinia._s.get(id);
        // 绑定getter的this
        return getters[getterKey].call(store);
      });
      return memo;
    }, {});
    return Object.assign(localState, actions, localGetters);
  };

  const store = createSetupStore(id, setup, pinia, true);
  store.$reset = function () {
    store.$patch((oldState) => {
      let initState = state ? state() : {};
      Object.assign(oldState, initState);
    });
  };
}
