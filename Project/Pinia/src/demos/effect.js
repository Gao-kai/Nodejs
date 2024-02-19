import { reactive, effect } from "vue";

const state = reactive({
  name: "lilei",
  age: 18,
});

// 依赖收集
const s1 = effect(() => {
  console.log(state.name);
});

// 依赖收集
const s2 = effect(() => {
  console.log(state.age);
});

// 终止响应
s1.effect.stop();
s2.effect.stop();

// 触发更新
state.name = "zhaosan";
state.age = 20;

console.log({
  s1,
  s2,
});
