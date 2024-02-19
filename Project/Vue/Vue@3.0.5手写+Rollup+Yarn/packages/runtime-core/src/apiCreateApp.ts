import { createVNode } from "./vnode";

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
let uid = 0;
export function createAppAPI(render) {
  return function createApp(rootComponent, roopProps) {
    const context = createAppContext();

    const app = (context.app = {
      // 高阶函数应用：在这里可以获取所有的参数 rendererOptions  rootComponent roopProps container
      _uid: uid++,
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

      unmount() {},

      use(plugin, ...options) {},

      mixin(componentOptions) {},

      component(name, component) {},

      directive(name, directive) {},

      provide(key, value) {},
    });

    return app;
  };
}
