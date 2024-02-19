import { reactive, effect, effectScope } from "vue";

const state = reactive({
  name: "lilei",
  age: 18,
});

const scope = effectScope(); // true表示独立的不嵌套

scope.run(() => {
  // 批量依赖收集
  effect(() => {
    console.log(state.name);
  });

  //   不传递表示默认时false 也就是嵌套的 传递了true才表示是独立的
  //   独立的effectScope不会受到父作用域的收集 其stop是独立的行为
  const nestScope = effectScope(true);
  nestScope.run(() => {
    effect(() => {
      console.log(state.age);
    });
  });
});

// 批量终止响应
scope.stop();

// 触发更新
state.name = "zhaosan";
state.age = 20;
