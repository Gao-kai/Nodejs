import { hasOwn } from "@gg-vue/shared";

/**
 * 这个porxy handlers主要就是拦截用户在render函数内部去proxy上取props、data、setupState的取值和存值行为
 *
 *  比如你的组件定义了一个state在setup中返回了 然后还定义了data和props等
 *  那么如何让用户在render函数内部直接用proxy.name可以去instance的props、setupState和data上取值
 *  就要通过代理来实现：proyx.name => instance.state.name
 */
export const PublicInstanceProxyHandlers = {
  /**
   *
   * @param target   target = instance.ctx = { _: instance };
   * @param key
   *
   * instance.ctx这个对象传递给render函数，会被参数proxy接受
   * render函数内部用户会去proxy上取props、data、setupState也就是setup函数的返回值是一个对象的时候
   * 比如：proxy.props.name
   */
  get({ _: instance }, key) {
    // 如果属性名以$开头 那么直接返回undefined
    if (key[0] === "$") {
      return undefined;
    }

    const { props, setupState, data } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    } else if (hasOwn(data, key)) {
      return data[key];
    } else {
      return undefined;
    }
  },
  set({ _: instance }, key, value) {
    const { props, setupState, data } = instance;
    if (hasOwn(setupState, key)) {
      setupState[key] = value;
    } else if (hasOwn(props, key)) {
      props[key] = value;
    } else if (hasOwn(data, key)) {
      data[key] = value;
    }
    return true;
  },
};
