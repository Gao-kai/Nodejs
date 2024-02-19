import { ImessageParams } from "./types";
import { render, createVNode, type VNode } from "vue";
import MessageComponent from "./Message.vue";
import { messageInstances } from "./instance";

let index = 0;

const closeMessage = (instance) => {
  const idx = messageInstances.indexOf(instance);
  if (idx === -1) return;
  messageInstances.splice(idx, 1);
  // instance.close();
};

const createMessage = (options: ImessageParams) => {
  /**
   * 1. 元素渲染到哪里？
   * 元素渲染到body上 因为在div中可能出现overflow：hidden的问题
   *
   * 2. 不能使用teleport
   * teleport是内置 一点击传送过去
   * 但是这里需要动态创建和销毁
   *
   * 在vue2中 使用
   * const instance = new Vue({render:h(Message)})
   * instance.$mount(body)
   *
   * 在vue3：
   * 1. 先将一个vue组件转化为vnode createVNode(component) 其实createVNode就是h函数 Vue 提供了一个 h() 函数用于创建 vnodes：
   * 2. 将虚拟节点渲染到某个容器中 render(vnode,container)
   */
  if (typeof options === "string") {
    options = {
      message: options,
    };
  }
  let userCloseFn = options.onClose;
  let offset = options.offset || 20;
  let id = options.id || index++;

  /**
   * 第一次创建：for循环不走 offset的值为20
   * 第二次创建：自身高度为40 offset的值为 20(顶端) + 40（自身）+ offset（假设用户传入为20）总计距离顶部80
   * 第三次创建：80 + 60 = 140px 距离顶部就是140px
   */
  messageInstances.forEach(({ vnode }) => {
    // 先拿到当前实例元素自身的高度和距离页面顶端top的值
    const top = 20;
    const offsetHeight = vnode.el!.offsetHeight + top;
    // 后一个总比前一个多offset 高度
    offset += offsetHeight;
  });

  let overrideOptions = {
    ...options,
    offset,
    id,
    // 如果用户没有传递 那么就帮用户制造一个 用于移除dom
    // 函数劫持和重写 用户的逻辑还会执行
    // 等价于在组件上绑定 但是Message创建时没有模板 @close="() => {}"
    onClose: (props) => {
      console.log(" onClose触发 组件即将卸载");
      userCloseFn?.();
      closeMessage(instance);
    },
    // 等价于在组件上绑定 但是Message创建时没有模板 @destory="() => {}"
    onDestory: (id) => {
      console.log(
        " onDestory触发 组件已经卸载 并且组件的挂载DOM div也从body移除"
      );
      render(null, container);
    },
  };
  /**
   * createVNode || h
   * 第一个参数既可以是一个字符串 (用于原生元素) 也可以是一个 Vue 组件定义。
   * 第二个参数是要传递的 prop
   * 第三个参数是子节点。
   */
  const container = document.createElement("div");
  const vnode = createVNode(MessageComponent, overrideOptions as any);
  render(vnode, container);
  document.body.appendChild(container.firstElementChild!);

  const vm = vnode.component;
  const close = () => (vm.exposed.visible.value = false);
  const instance = {
    id,
    vnode,
    vm,
    close,
    props: vm.props,
  };
  return instance;
};

const GMessage = (options: ImessageParams) => {
  const instance = createMessage(options);
  messageInstances.push(instance);
  return instance;
};
export default GMessage;
