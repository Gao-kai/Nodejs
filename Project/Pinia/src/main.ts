import { createApp } from "vue";
// import { createPinia } from "pinia";
import { createPinia } from "./pinia/index.js";
import App from "./App.vue";
import { useCounterStore2 } from "./stores/counter";
const pinia = createPinia();

/* 
  插件的核心就是利用subscribe和onAction做一些事情 
  每次创建一个store 就执行一次插件 */

pinia.use(({ store }) => {
  let local = localStorage.getItem(store.$id + "PINIA_STATE");
  if (local) {
    store.$state = JSON.parse(local);
  }

  store.$subscribe(({ storeId: id }, state) => {
    localStorage.setItem(id + "PINIA_STATE", JSON.stringify(state));
  });

  return { b: 2 };
});

const app = createApp(App);
app.use(pinia);

// import "./demos/effect.js";
// import "./demos/effectScope.js";

console.log({
  pinia,
  createPinia: createPinia.toString(),
});

app.mount("#app");

/* 
 保证在路由钩子beforeHooks的js文件中也可以使用pinia
*/
const store = useCounterStore2();
console.log(store);
