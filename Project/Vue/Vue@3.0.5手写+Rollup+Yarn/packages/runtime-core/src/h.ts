import { isArray, isObject } from "@gg-vue/shared";
import { createVNode, isVNode } from "./vnode";

/**
 * @description h函数多出现在render函数中 是createVnode的简写 但是它比createVnode更加灵活
 * @description 正是因为这种参数灵活 我们才需要进行一次统一的格式化然后交给createVnode执行
 * @param type
 * @param propsOrChildren
 * @param children
 * @returns
 */
export function h(type, propsOrChildren, children) {
  console.log({
    type,
    propsOrChildren,
    children,
  });

  const l = arguments.length;

  /**
   * 1. h函数的第一位参数是必传的
   * 2. h函数可以省略第二个参数，并且可以进行嵌套
   *
   * l = 2那么说明另外一位参数要不是props 要不是children
   *
   * 1. 当参数是对象并且不是数组，此时有两种情况
   *    + 对象是props
   *     h('div',{name:'lilei'})
   *    + 对象是嵌套的h函数返回值也就是虚拟vnode
   *     h('div',h('p'))
   *        此时应该将 嵌套的h函数返回值的虚拟节点对象当前children传入
   *        注意h函数的返回值只能当做children 并且包装在数组里面
   *
   * 2. 否则那么就是下面两种情况：
   *    + 传递的是一个字符串   h('div',’666‘)
   *    + 传递的是一个数组  h(div,[hello,h(span)])
   *    以上两种情况都可以直接当做第三个参数传递过去即可
   */

  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      } else {
        return createVNode(type, propsOrChildren);
      }
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    /**
     * 长度大于3：说明从第三个开始全部都是children 必须以数组包裹
     * 长度等于3：
     *  + 最后一个参数是虚拟节点 也就是h函数返回值 此时包装为数组当做children
     *  + 最后一个参数是字符串
     */
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }

    return createVNode(type, propsOrChildren, children);
  }
}
