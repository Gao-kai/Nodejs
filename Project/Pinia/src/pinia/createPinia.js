import { effectScope, ref } from "vue";
import { piniaSymbol } from "./rootStore";

export let activePinia;
export const setActivePinia = (pinia) => (activePinia = pinia);

export function createPinia() {
  // 用来存储每一个store的state的
  /* 
    1. 存放计算属性
    2. 包一层 然后全部停止
  */
  const scope = effectScope();
  //   scope.run的返回值就是内部回调函数的返回值
  const state = scope.run(() => {
    return ref({});
  });
  //   可以通过scope.stop方法可以一次性全部停止响应 对外暴露的是store.$dispose

  const _p = [];
  const pinia = {
    // 用来存放所有id到store的映射
    _s: new Map(),
    _e: scope,
    _p,
    state,
    install(app) {
      setActivePinia(pinia);
      // pinia的核心是管理所有的store

      // pinia要去收集所有store的信息，如何想卸载store怎么办？

      // 如何让所有的store都可以获取到pinia这个对象呢
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
