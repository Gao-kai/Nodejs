# 从零手写实现 Vue3 状态管理工具-Pinia

本篇文章分为大致以下几个模块：

1. Pinia 的特点以及和 Vuex 的对比
2. createPinia 的实现
3. defineStore 的实现
4. Pinia 核心 API 的实现
5. Pinia 的插件系统实现

## 一、Pinia 的特点以及和 Vuex 的对比

在 Pinia 出现以前，Vue 技术栈中关于全局状态管理工具使用最多的就是 Vue 官方团队推出的 Vuex 状态管理工具，Vuex 基本可以满足日常开发中大多数业务场景，但是 Vuex 还是有其自身的一些缺点，比如：

1. Vuex 中所有状态的取值都是去 store.state 上取值，并且根模块产生的子模块也会添加到 state 上，假设有一个 user 模块中有一个状态 name，但是在根模块中也产生一个 user 状态的话，此时就会产生状态的冲突。
2. Vuex 中的树状结构不好维护，举个例子：当我们去读取一个嵌套很深的模块中的状态 state 的时候，我们需要 store.a.b.xxx 这样子去取值，很明显这种写法的代码可读性不高，维护不友好。
3. Vuex 中的状态管理流程比较长，我们往往需要走一个完整的 action-mutation-state 的流程，但是很多时候其实只需要 action 就可以完成状态的管理。

针对于 Vuex 的以上不足，Pinia 采用了以下方案来实现更加适合与 Vue3 Composition API 的状态管理工具，比如：

1. 扁平化的多仓库管理，相比于 Vuex 的单仓库管理形成的复杂的嵌套树结构，扁平化的仓库管理配合 Hooks 写法，更加适合 Vue3.0 项目的开发。

2. Pinia 中引起状态管理只有 action，没有 mutation 会减少状态管理的流程，减少开发者的心智负担。

3. 相对比 Vuex，Pinia 的体积更小，并且支持 DevTools 和 Ts 的类型提示。
4. Pinia 也是向下兼容的，不仅支持 Vue2 中的 options 写法，也支持 Vue3 的 setup 写法，并且 Pinia 也提供了诸如 mapState、mapGetters 等方法。

## 二、createPinia 的实现

我们先来看下 Pinia 在 Vue3 项目中是如何使用的：

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount("#app");
```

可以看出，Pinia 是通过 createPinia 方法创建出来的一个 Vue 插件，然后通过 app.use 方法完成插件的注册，我们知道一个 app.use 方法接收一个对象或者函数，如果是一个对象那么这个对象必须部署 install 方法暴露给 Vue 进行插件的注册，基于传入的参数 app 实例来实现全局拓展的作用。

下面是 createPinia 方法的实现，下面依次介绍关键点：

### 1. 如何保证在 Vue 的任意的组件实例上都可以获取到 pinia 这个对象呢？

pinia 的做法很简单，就是在执行 install 函数的时候获取到 app 实例，然后基于下面两个 api 将 pinia 注入到全局：

- 在 Vue3.0 中基于 app.provide(piniaSymbol, pinia)注入，然后在任意组件中基于 inject 取回，为了保证唯一的 key，这里采用了 Symbol 来实现唯一 key。

- 在 Vue2.0 中基于 app.config.globalProperties.$pinia = pinia;这是对 Vue 2 中 Vue.prototype 使用方式的一种替代，我们可以在任意的组件实例 this 上获取。

### 2. 全局产生的 pinia 对象中可能管理多个 store 的 state，如何实现？

pinia 的做法是先通过 Vue3 的 effectScope 方法产生一个 effect 作用域，然后将所有的未来可能产生的任意仓库的 state 都统一放到当前这个作用域下，这样做的好处在于一旦需要终止 store 的 state 更新，我们可以直接基于 effectScope 方法的返回值 scope 上的 stop 方法一次性终止 state 的响应式。

随后 pinia 会将这个 state 对象存放在自身的 state 属性上，用来保存所有仓库的状态。

除此之外，pinia 上还有几个属性：

1. `_s`:值是一个 map 对象，key 是 store 的 id，value 就是每个 store 中单独管理的 state
2. `_p`:值是一个数组，保存了所有调用 pinia.use 注册的插件集合
3. `_e`:值是前面说的 effectScope 方法返回的 scope 对象，用于实现批量终止响应式

### 3. 在非 Vue 组件比如 js 中调用 defineStore 会报错，因为纯 js 中无法直接通过 inject 或者组件实例获取 pinia，此时该如何解决？

pinia 是通过全局变量的方式解决的，首先 pinia 暴露出一个全局变量 activePinia，在 pinia 插件 install 的时候就会将产生出来的 pinia 对象通过 setActivePinia 方法赋值给这个全局变量，后续无论在 vue 文件或者 js 文件中都可以通过这个全局变量来获取活跃的 pinia 对象。

```js
import { effectScope, ref } from "vue";

export const piniaSymbol = Symbol();
export let activePinia;
export const setActivePinia = (pinia) => (activePinia = pinia);

export function createPinia() {
  const scope = effectScope();
  const state = scope.run(() => {
    return ref({});
  });
  const _p = [];
  const pinia = {
    _s: new Map(),
    _e: scope,
    _p,
    state,
    install(app) {
      setActivePinia(pinia);
      app.provide(piniaSymbol, pinia); // vue3
      app.config.globalProperties.$pinia = pinia; // vue2
    },
    use(plugin) {
      _p.push(plugin);
      return this;
    },
  };
  return pinia;
}
```

## 三、defineStore 的实现

Pinia 提供了两种写法来定义一个仓库 store，可以是 options 写法：

```js
export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

同时 options 写法中的仓库 id 还可以这样写：

```js
export const useCounterStore = defineStore({
  id: "counter",
  /* xxx */
});
```

也可以是 setup 写法：

```js
export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});
```

### 1. defineStore 的参数和返回值

Pinia 中的核心 API defineStore 方法的第一个参数可以是字符串、可以是一个函数还可以是一个对象，并且这个函数会返回一个新的函数 useStore，当我们在任意组件中调用 useStore 的时候，它会返回给我们一个 store 对象，store 对象上必须有以下属性和方法：

```bash
- "$id" 模块 id
- "$onAction" 监听 store 的 action 派发，可以注入回调函数
- "$patch" 派发修改状态的动作
- "$reset" 重置仓库
- "$subscribe" 订阅仓库的变化并基于回调实现一些特殊的逻辑
- "$dispose" 取消仓库中状态的响应式特性
- "count" 仓库中的状态
- "increment" 仓库中的 action
- "double" 仓库中的 getters
```

基于以上信息我们可以像实现一个简化版本的 defineStore 函数：

```js
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

  function useStore() {
    /* xxx */
  }

  return useStore;
}
```

### 2. useStore 方法的实现

useStore 方法是 pinia 内部和核心方法，主要由三步构成：

1. 基于当前调用环境确定 pinia 对象；
   如果在组件中就通过 getCurrentInstance 方法获取组件实例然后 inject 获取 pinia；否则在 js 加载就通过全局变量 activePinia 来获取 pinia；
2. 通过 pinia 对象上的 map 对象查询是否存在 id 对应的 store，如果已经存在直接返回；
3. 如果不存在，那么基于传入的是 option 选项还是 setup 选项来生成 store 并将 store 返回

```js
export function defineStore(idOrOptions, setup) {
  /* 前面的代码中已经确定了id和options */
  const isSetupStore = typeof setup === "function";

  function useStore() {
    let instance = getCurrentInstance();
    let pinia = instance && inject(piniaSymbol);
    if (pinia) {
      setActivePinia(pinia);
    }

    pinia = activePinia;
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, pinia);
      } else {
        createOptionStore(id, options, pinia);
      }
    }

    const store = pinia._s.get(id);
    return store;
  }
}
```

### 3. 传入参数为 setup 函数时 createSetupStore 的实现

传入的参数为 setup 函数时，pinia 只需要执行这个 setup 函数，函数的返回值就是当前用户定义的状态对象，但是 pinia 在这里做了以下处理：

1. 先创建一个 store 并将 partialState 当做初始值，partialState 主要用于存放 pinia 提供给之前说的每一个仓库的内置 api，比如$patch、$onAction 等方法。

2. 创建出初始的 store 之后先存入 pinia 的 map 对象中，key 就是用户存入的仓库 id，value 就是创建出来的 store 对象。

3. 除此之外 pinia 还需要收集当前仓库的 state 到自身，这一步通过 pinia.state.value[id]来创建出一个初始的状态，后续会将当前仓库的 state 添加进去。

4. 用户传入的 setup 函数中的状态会通过前面说的 scope.run 来执行并获取到返回值，并将返回值赋值给 setupStore 变量，setupStore 区别与一开始创建的 store，主要存放的是非内置的，也就是由用户提供的 state、getters 以及 action 等。

5. 将用户传入的 setupStore 进行进一步的处理，主要的含义在于 pinia 自身的 state 对象上只需要保存用户传入的 state，而 getters 或者 action 是不需要保存的，所以这里需要过滤掉函数和计算属性，只保留 state 即可。这里还有一个注意的点就是计算属性通过 isRef 判断也会返回 true，那么如何判断一个值是计算属性呢，答案就是只要一个值是 Ref 并且这个值有 effect 属性，那么就是计算属性，因为只有计算属性才是 effect，普通的 ref 不是。

6. 最后将 store 和 setupStore 进行合并，合并之后的对象就是用户通过 usexxxStore 方法调用的返回值，用户就可以基于 store 对象进行状态的更新和维护。

```js
function createSetupStore(id, setup, pinia, isOption) {
  const partialState = {};
  const store = reactive(partialState);
  pinia._s.set(id, store);

  const initialState = pinia.state.value[id];
  if (!initialState && !isOption) {
    pinia.state.value[id] = {};
  }

  let scope;
  let piniaScope = pinia._e;
  const setupStore = piniaScope.run(() => {
    scope = effectScope();
    return scope.run(() => setup());
  });

  function isComputed(v) {
    return !!(isRef(v) && v.effect);
  }

  for (const key in setupStore) {
    let prop = setupStore[key];
    if (typeof prop === "function") {
      // 对action中的this和后续逻辑进行处理 函数劫持
      setupStore[key] = wrapAction(key, prop);
    }

    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      if (!isOption) {
        pinia.state.value[id][key] = prop;
      }
    }
  }

  Object.assign(store, setupStore);
  return store;
}
```

### 4. 传入参数为 options 对象时 createOptionStore 的实现

当传入参数是一个 options 选项时，其实这个思路很简单，pinia 内部将传入的 options 包装为一个 setup 函数，然后调用上面的 createSetupStore 函数，就可以实现一样的效果，下面来看代码，我们首先捋一下思路：

1. 第一步肯定也是将用户传入的 state 取出，这里的 state 也是一个函数，函数执行之后的返回值是一个 js 对象，和 Vue2 中的 data 类似。pinia 首先要做的还是先执行这个函数，然后将状态收集到自身的根 state 对象中。

2. 收集完成之后，首先来做 state 的转化，这里采用 toRefs 将一个 js 对象中的每一个属性值都采用 Ref 包裹，然后返回一个新的对象，这就等同于 setup 中的 ref(value)。

3. 下面是 getters 的转化，pinia 通过 reduce 函数将所有 getters 对象中的函数取出，然后通过 computed 进行包装，注意这个过程中实现了 getter 函数中 this 的绑定，使 getter 函数中 this 永远指向 store 对象，最终将所有计算属性收敛到一个对象上用于最终合并。

4. 将包装后的 ref、computed 以及 action 进行合并，并手动创建一个 setup 函数当做传入传递给 createSetupStore 方法。

```js
function createOptionStore(id, options, pinia) {
  const { state, actions, getters } = options;

  const setup = () => {
    let localState = (pinia.state.value[id] = state ? state() : {});

    /* ref绑定 */
    localState = toRefs(pinia.state.value[id]);

    /* getter绑定 */
    const getterKeys = Object.keys(getters || {});
    const localGetters = getterKeys.reduce((memo, getterKey) => {
      memo[getterKey] = computed(() => {
        let store = pinia._s.get(id);
        return getters[getterKey].call(store);
      });
      return memo;
    }, {});
    return Object.assign(localState, actions, localGetters);
  };

  const store = createSetupStore(id, setup, pinia, true);
}
```

## 四、Pinia 核心 API 的实现

上面我们已经实现了 Pinia 的核心逻辑，接下来需要依次实现 Pinia 的核心 API，也就是每一个 store 都有的用于修改状态、订阅状态、取消状态的方法等。

### $patch 方法 的实现

Pinia 中使用$patch 方法提供了两种用法：

1. 可以直接传入部分状态，类似 react 的 setState，这部分状态会替换旧的状态
2. 可以直接传入一个函数，函数的参数是当前 store 的 state，函数内执行的结果会修改旧的状态

```js
function $patch(partialStateOrMutator) {
  let prevState = pinia.state.value[id];
  if (typeof partialStateOrMutator === "object") {
    // 这里就是新老状态的合并 用法如store.$patch({state:200})
    mergeReactiveObject(prevState, partialStateOrMutator);
  } else if (typeof partialStateOrMutator === "function") {
    // 这里就是新老状态的合并 用法如store.$patch((state)=>state.count = 100)
    partialStateOrMutator(prevState);
  }
}
```

这里的重点在于新老状态的合并，也就是 mergeReactiveObject 方法的实现，target 是目标对象，state 就是用户传入的部分对象

```js
function mergeReactiveObject(target, state) {
  for (const key in state) {
    let oldValue = target[key];
    let newValue = state[key];
    // 新旧都是对象 那么递归合并
    if (isObject(oldValue) && isObject(newValue)) {
      target[key] = mergeReactiveObject(oldValue, newValue);
    } else {
      target[key] = newValue;
    }
  }

  return target;
}

// 源码内部关于纯js对象的判断
function isObject(v) {
  return (
    typeof v === "object" &&
    v !== null &&
    Object.prototype.toString.call(v) === "[object Object]" &&
    typeof v.toJSON !== "function"
  );
}
```

### $reset 的实现

$reset方法只能用于options定义仓库的形式，这个方法实现其实很简单，就是将初始化时传入的options.state函数重新执行一次得到初始值，然后通过上面的$patch 方法将这个初始对象覆盖当前 state 对象不就是 reset 重置的效果吗？

```js
store.$reset = function () {
  store.$patch((currState) => {
    let initState = state ? state() : {};
    Object.assign(currState, initState);
  });
};
```

### $dispose 的实现

store.$dispose 主要用于将当前 store 的状态取消掉响应式状态，并依次取消当前仓库状态的订阅。

```js
function $dispose() {
  scope.stop();
  actionSubscriptions = [];
  pinia._s.delete(id);
}
```

### $state 的实现

每一个 store 上还有一个内置属性$state 用于保存 store 自己的 state，这是一个属性不是一个方法，它的实现如下：

```js
Object.defineProperty(store, "$state", {
  get() {
    return pinia.state.value[id];
  },
  // 一旦赋值就触发store.$patch进行状态的合并即可
  set(newState) {
    store.$patch((prevState) => {
      Object.assign(prevState, newState);
    });
  },
});
```

### $subscribe 的实现

store 的$subscribe 方法主要用于订阅 store 中状态的变化，并在状态的变化时执行用户自己的逻辑，也就是传入的 calback 函数，这个方法实现也非常简单，无非就是使用 watch 来监听当前 store 的 state，然后状态发生变化时执行 callback，并将最新的 newState 当做参数传递过去即可。

```js
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
```

### $onAction 的实现

store.$onAction方法的实现相对比较复杂，因为这里会用到一个发布订阅模式和函数劫持的思想，首先我们来看看$onAction 是如何使用的：

```js
counterStore1.$onAction(({ after, onError }) => {
  console.log("$onAction", counterStore1.count);

  after(() => {
    console.log("after1", counterStore1.count);
  });

  onError(() => {
    console.log("onError");
  });
});
```

每当我们调用 store.$patch派发一个action的时候，就会执行$onAction 传入的 callback，这很明显是通过发布订阅模式来实现的，并且执行$onAction时传入的callback函数还接受一个对象作为参数，对象中可以解构出after和onError两个参数，after用来实现当$patch 完成状态修改后执行的逻辑，onError 自然不用多说，就是执行 action 出错时需要执行的方法。

首先要实现$onAction，我们发现了执行$onAction 的过程就是订阅的过程，所以我们必须先手写一个简易版的发布订阅模式：

```js
/* 添加订阅 */
function addSubscription(subscriptions, callback) {
  subscriptions.push(calback);

  const removeSubscription = () => {
    const index = subscriptions.findIndex((cb) => {
      callback === cb;
    });
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
  };

  return removeSubscription;
}

/* 发布 */
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((cb) => cb(...args));
}
```

你可能会问这和我们平时的发布订阅有点不一样啊，先不着急往下看就明白了。接下来我们首先实现$onAction方法的第一步那就是完成订阅，这是最简单的一步，其实就是将上面写好的addSubscription赋值给$onAction 即可，然后再赋值的时候绑定函数运行时的预置参数为一个数组 actionSubscriptions 即可，这样子执行$onAction 的时候只需要传入一个函数 callback，由于内置了参数 actionSubscriptions，所以直接传入一个 callback 即可：

```js
let actionSubscriptions = [];
store.$onAction = addSubscription.bind(null, actionSubscriptions);
```

订阅完成之后在什么时候发布呢？答案就是用户在 defineStore 时传入的 action 函数执行时，这里有两个难点：

1. 用户传入的 options 选项中的 action 函数其内部 this 必须是 store，如何保证？
2. 需要再用户执行 action 函数时发布，该如何实现？

答案就是切片编程，也可以叫做高阶函数的运用，我们可以用一个高阶函数 wrapAction 将用户传入的 action 函数包装一层后返回，在函数执行前后插入一些额外的逻辑而又不会影响到原本函数的执行结果。

在实现 createSetupStore 的时候说过，这里会产生两个 store：

1. 第一个 store 用于挂载所有 store 都共同拥有的内置 API，比如$patch、$subscribe 等
2. 第二个 setupStore 用于执行用户传入的 setup 函数，并存放用户传入的仓库状态、getter 以及 action

那么我们应该首先从 setupStore 中获取到 action，然后进行切片：

```js
const setupStore = piniaScope.run(() => {
  scope = effectScope();
  return scope.run(() => setup());
});
for (const key in setupStore) {
  let value = setupStore[key];
  if (typeof value === "function") {
    // 在这里实现切片编程 key就是用户传入的action的函数名 value就是函数值
    setupStore[key] = wrapAction(key, value);
  }
}
```

下面我们来实现核心 wrapAction 函数,首先实现了上面说的第一个问题，那就是实现 action 执行时的 this 绑定：

```js
const store = reactive(partialState);

function wrapAction(name, action) {
  return function (...args) {
    let res = action.apply(store, args);
    return res;
  };
}
```

接下来实现$onAction 中订阅发布的功能，并实现 after 和 onError 的功能，这里可以看到之前发布订阅模式实现的妙用，就是可以不强耦合到一个类上，而是将依赖收集和发布完全分隔开来，比如这里既可以调用 triggerSubscriptions 的时候传入的参数数组可以是 actionSubscriptions，也可以是 afterCbList，也可以是 onErrorCbList，更加的灵活。

```js
const store = reactive(partialState);

function wrapAction(name, action) {
  return function (...args) {
    const afterCbList = [];
    const onErrorCbList = [];

    // 执行after的时候收集依赖
    const after = (callback) => {
      afterCbList.push(callback);
    };

    // 执行onError的时候收集依赖
    const onError = (callback) => {
      onErrorCbList.push(callback);
    };

    // 发布前面收集的订阅函数 并将callback执行的参数after和onError传递过去
    triggerSubscriptions(actionSubscriptions, { after, onError });

    let res;
    try {
      res = action.apply(store, args)
    } catch (error) {
      triggerSubscriptions(onErrorCbList, error);
    }

    // action的执行值可能是一个promise
    if(res instanceOf Promise){
      return res.then((value)=>{
        // 将after函数依次发布
        triggerSubscriptions(afterCbList, value);
      }).catch(err=>{
        // 将onError函数依次发布
        triggerSubscriptions(onErrorCbList, err);
        return Promise.reject();
      })
    }

    // 如果不是promise
    triggerSubscriptions(afterCbList, value);
    return res;

  };
}
```

### storeToRef 的实现

当我们在组件中使用 store 中的状态时，我们可能是这样使用的：

```html
<template>
  <h1>Pinia</h1>
  <h1>{{ count }}</h1>
  <h1>{{ double1 }}</h1>
</template>

<script>
  import { useCounterStore } from "./stores/counter";

  const store = useCounterStore();
  const { count, double1 } = store;
</script>
```

但是很遗憾，这种解构的写法会导致解构出来的值失去响应式，为了解决这个问题，我们可以使用 vue 内置的 api toRefs，将整个 store 对象中的每一个 key 对应的属性值都转化为 ref 响应式对象：

```js
import {useCounterStore} from "./stores/counter";
import {toRefs} from 'vue';

const store = useCounterStore();
const {(count, double1)} =toRefs(counterStore)
```

但是这样有一个问题 store 中不仅仅存在状态，还可能存在 action 函数，为了解决这个问题 pinia 自己提供了一个 api：storeToRef 专门来解决这个问题，其实就是只把 store 中的 ref 和 reative 转化为 ref 响应式对象，action 函数不进行转化：

```js
export function storeToRefs(store) {
  // 由于for循环会触发store的getter 所以先转化为基本的值
  store = toRaw(store);
  const refs = {};
  for (let key in store) {
    let value = store[key];
    if (isRef(value) || isReactive(value)) {
      refs[key] = toRef(store, key);
    }
  }

  return refs;
}
```

## 五、Pinia 的插件系统实现

Pinia 的插件是基于 pinia.use 方法实现的，当我们执行 use 方法的时候，代表每次我们 defineStore 的时候就需要将传入的回调函数执行，在 callback 内部我们就可以基于 subscribe 和 onAction 方法来订阅 store 状态的改变或者 action 派发的动作实现一些业务逻辑，比如常见的 store 状态持久化：

```js
const app = createApp(App);
const pinia = createPinia();
pinia.use(({ store }) => {
  let localState = localStorege.getItem(store.$id + "PINIA_STATE");
  if (localState) {
    store.$state = JSON.parse(local);
  }

  store.$subscribe(({ storeId: id }, state) => {
    localStorege.setItem(store.$id + "PINIA_STATE", JSON.stringify(state));
  });
});
```

那么 Pinia 是如何实现 use 方法的呢，其实答案很简单，这就是一个发布订阅模式，只不过调用的时机不同而已：

```js
const _p = [];
const pinia = {
  use(plugin) {
    _p.push(plugin);
    return this; // chain call
  },
};
```

在 defineStore 的时候也就是 createSetupStore 的时候，从 pinia 上取出 plugin 数组然后依次执行，执行的时候需要将插件执行的返回值合并到当前的 store 上：

```js
function createSetupStore(id, setup, pinia, isOption) {
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
}
```
