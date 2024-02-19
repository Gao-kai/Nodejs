import { ShapeFlags, isFunction, isObject } from "@gg-vue/shared";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

/**
 * @description 基于组件的虚拟dom创建一个组件实例instance
 * @param vnode 组件的vNode
 * @returns
 *
 * 补充：组件的props和attrs分别代表什么?
 *
 * 父组件中使用：
 * <header name="lilei" age="18" isShow="flase"></header>
 *
 * 子组件header内部的只接受了name和age，那么：
 * 子组件的props = {name,age}
 * 子组件的attrs = {isShow} 所有没有被props接受的属性集合都时attrs
 *
 * @description instance 包含一系列组件状态的js对象 比如props\setupState\attrs\slots等
 * @description context Vue内部将一些常用的属性和对象从instance中抽离出来 通过setup参数传递给用户使用
 * @description proxy 专门来代理访问instance的代理对象 让用户在render函数中更加方便取值
 */
let uid = 0;
let currentInstance = null;

export function createComponentInstance(vnode) {
  const instance = {
    uid: uid++,
    vnode,
    ctx: {},
    type: vnode.type, // createvNode时传入的html tag字符串或者组件的js对象
    props: {}, // 组件的属性
    attrs: {}, // 组件的attrs
    slots: {},
    data: {},
    setupState: {}, // 如果setup返回一个对象 这个对象会被当做setupState
    setupContext: null, // setup函数执行时的上下文对象
    render: null, // 调用setup返回的可能是一个render方法 会被填充到这里
    isMounted: false, // 标识此组件是否挂载了，
    proxy: null,
    update: null,
    subTree: null,
  };

  instance.ctx = { _: instance };

  return instance;
}

/**
 * @description 解析组件实例instance 将需要的数据解析然后挂载到实例instance上
 * @param instance
 */
export function setupComponent(instance) {
  const vnode = instance.vnode;
  const { props, children, shapeFlag } = vnode;

  // 基于虚拟节点vnode中得到的props, children 解析之后放到组件实例instance上
  instance.props = props; // initProps
  instance.children = children; // initSlots

  // 判断是普通组件还是函数式组件
  const isStateful = shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
  // 如果有状态调用当前组件实例的render/setup方法 用返回值来填充instance上的setupState属性和render方法
  const setupResult = isStateful ? setupStatefulComponent(instance) : undefined;
  // 将setup函数执行的结果返回
  return setupResult;
}

export function setupStatefulComponent(instance) {
  // 1. 代理 不用instance.props.xxx instance.data.xxx 去访问
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);

  // 2. 拿到传入的组件对象 并获取到用户写的setup函数
  const Component = instance.type;
  let { setup } = Component;

  if (setup) {
    //   创建setup在执行时的参数props和context 只有当用户传入的setup函数的参数大于1时才需要
    const setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    instance.setupContext = setupContext;

    /**
     * 将instance上很多属性中提取一些常用的属性和方法传递给setup的第二个参数context
     * 通过参数暴露出来供用户直接调用
     * 所以组件的实例instance和组件的context是不同的 后者基于前者得到 是一个子集
     */
    const setupResult = setup(instance.props, instance.setupContext);
    handleSetupResult(instance, setupResult);
  } else {
    /**
     * 如果传入的组件对象上有render函数 那么还需要执行render函数
     * render函数的参数proxy是一个代理了组件的instance实例对象的代理对象
     * 用户去proxy上取值 就会被拦截代理到去instance上的props data setupState上取值
     */
    finishComponentSetup(instance);
  }
}

/**
 * @description 基于setup函数执行返回值(render函数|对象)进行处理
 * @param instance
 * @param setupResult
 */
function handleSetupResult(instance, setupResult) {
  // 返回值是函数 那么这个函数就被当做实例的render函数
  if (isFunction(setupResult)) {
    instance.render = setupResult;
  } else if (isObject(setupResult)) {
    // 返回值是对象 那么这个函数就被当做实例的setupState
    instance.setupState = setupResult;
  }

  // 组件初始化完成
  finishComponentSetup(instance);
}

/**
 * @description render函数优先级问题
 * 1. setup返回值是一个函数 那么优先使用
 * 2. 其次是用户自己传递的render函数
 * 3. 最后才是用户传入的模板template编译的结果
 * @param instance
 */
function finishComponentSetup(instance) {
  const Component = instance.type;
  /**
   * 1. render函数的来源是多元的 这一步首先确定render函数
   * 实例上没有render函数 说明setup没有返回render函数
   * 此时如果Component对象用户传递了render函数 那么自己用
   * 此时如果Component对象用户没有传递render函数并且有模板 那么去进行模板编译生成一个render函数
   */
  if (!instance.render) {
    if (Component.template && !Component.render) {
      // 执行模板编译并将结果赋值给Component.render
      // Component.render = compile(Component.template)
    }

    // 情况1:用户自己传递了Component.render函数 此时用用户自己的
    // 情况2：用户没有传递模板 并且没有传递render函数 此时给一个空函数() => {}
    instance.render = Component.render || (() => {});
  }

  /**
   * 2. Vue2.0 选项式API的兼容applyOptions
   */
  // applyOptions(instance, Component)
}

export function createSetupContext(instance) {
  return {
    props: instance.props,
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  };
}
