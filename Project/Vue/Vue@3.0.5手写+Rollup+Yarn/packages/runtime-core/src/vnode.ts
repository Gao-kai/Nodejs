import {
  ShapeFlags,
  isArray,
  isFunction,
  isObject,
  isString,
} from "@gg-vue/shared";
/**
 * @description Vue3.0官方文档对于createVNode的描述
 *
 * 1. createVNode函数专门用来创建虚拟节点 但是它还有另外一个名字那就是h函数
 * 2. h() 是 hyperscript 的简称——意思是“能生成 HTML (超文本标记语言) 的 JavaScript”。这个名字来源于许多虚拟 DOM 实现默认形成的约定。
 * 3. h函数的参数非常灵活：
 *  + 第一个参数可以是一个html标签字符串 也可以是一个component对象
 *  + 第二个参数是要传递的 prop
 *  + 第三个参数是子节点
 *  + 当创建一个组件的 vnode 时，子节点必须以插槽函数进行传递。+
 *  + 当子节点不是插槽对象时，可以省略 prop 参数。
 *  + 如果组件只有默认槽，可以使用单个插槽函数进行传递。否则，必须以插槽函数的对象形式来传递。
 *
 *
 * @param type {string | Component}  代表类型可以是组件对象或者原生html元素的字符串
 * @param props 属性对象
 * @param children 子节点 可能是字符串或者vNode
 */
export function createVNode(type, props: any = {}, children = null) {
  /* 给虚拟节点打上类型标记 */
  let shapeFlag;
  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT; // HTML元素 1
  } else if (isObject(type)) {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT; // 普通组件 4
  } else if (isFunction(type)) {
    shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT; // 函数组件 2
  } else {
    shapeFlag = 0;
  }

  /**
   * 核心的虚拟DOM节点 本质就是用js对象来描述一个UI节点
   * 好处1：是具有跨平台的能力 不限于浏览器 node中也可以体验到vue-runtime-core的能力
   * 好处2：可以在更新时进行patch 只更新变化的节点 减少dom操作
   */
  const vnode = {
    __v_isVNode: true, // 表示虚拟节点
    key: props && props.key,
    type, // 组件还是元素
    props,
    children,
    component: null, // 存放组件对应的实例
    el: null, // 真实dom和虚拟dom的链接点 在更新的时候用于获取上一次的虚拟dom
    shapeFlag, // 类型
  };

  normalizeChildren(vnode, children);

  return vnode;
}

/**
 * @description 基于当前的虚拟节点是否有children子节点来修正虚拟节点的类型
 * 比如vnode是一个组件类型 但是由于有了子节点 应该是一个带有子节点的组件类型
 * @param vnode
 * @param children
 */
function normalizeChildren(vnode, children) {
  let type = 0;

  if (children == null) {
    children == null;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }

  /**
   * 进行或运算 可以得出自己的类型和儿子的类型 比如：
   * 00000010 | 00010000 => 00010010
   * 自己的类型是一个元素element
   * 儿子的类型是一个文本节点还是一个数组组成的节点
   */
  vnode.shapeFlag = vnode.shapeFlag | type;
}

export function isVNode(value: any) {
  return value ? value.__v_isVNode === true : false;
}

export function normalizeVNode(child) {
  // 说明本身就是用h函数创建出来的虚拟节点 直接返回即可
  if (isObject(child)) {
    return child;
  } else {
    // 说明是文本节点 type, props children
    return createVNode(Text, null, String(child));
  }
}

export const Text = Symbol("Text");
export const Comment = Symbol("Comment");
export const Static = Symbol("Static");
