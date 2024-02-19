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
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProps";
import { createRenderer } from "@gg-vue/runtime-core";

// 将操作dom节点和更新属性、事件、style、class等方法进行合并
const rendererOptions = Object.assign({}, nodeOps, { patchProp });

export const createApp = function (rootComponent, roopProps = null) {
  // 1. 创建渲染器 createRenderer是runtime-core的核心
  const renderer = createRenderer(rendererOptions);

  // 2. 基于渲染器创建App实例
  const app: any = renderer.createApp(rootComponent, roopProps);

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

export * from "@gg-vue/runtime-core";
export * from "@gg-vue/reactivity";
