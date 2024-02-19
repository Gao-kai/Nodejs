import { ShapeFlags, isObject } from "@gg-vue/shared";
import { effect } from "@gg-vue/reactivity";
import { createAppAPI } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { createVNode, normalizeVNode, Text } from "./vnode";
import { queneJob } from "./scheduler";

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

export function createRenderer(rendererOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
  } = rendererOptions;

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
        if (shapeFlag & ShapeFlags.ELEMENT) {
          console.log("这是一个HTML元素的虚拟DOM节点", newVNode);
          processElement(oldVNode, newVNode, container);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          console.log("这是一个普通有状态组件的虚拟DOM节点");
          processComponent(oldVNode, newVNode, container);
        } else if (shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT) {
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
    } else {
    }
  };

  const processElement = function (oldVNode, newVNode, container) {
    if (oldVNode == null) {
      // 元素挂载
      mountElement(newVNode, container);
    } else {
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
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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

  const patchElement = function () {};

  const processComponent = function (oldVNode, newVNode, container) {
    // 第一次挂载
    if (oldVNode == null) {
      mountComponent(newVNode, container);
    } else {
      // 更新 需要dom diff
      updateComponent(oldVNode, newVNode, container);
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
    instance.update = effect(
      function componentEffect() {
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
        } else {
          // 更新组件逻辑
          console.log("更新组件");
        }
      },
      {
        // 调度器会优先执行 不会再去执行effect也就是这里的componentEffect函数
        // 调度器函数执行的时候会将componentEffect本身当做参数传递过去
        scheduler: queneJob,
      }
    );
  };

  const updateComponent = function (oldVNode, newVNode, container) {};

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
