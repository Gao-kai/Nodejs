/**
 * Vue3.0中对于虚拟节点类型type的判断常量枚举
 *
 * 1. 为什么是位运算？
 *   因为是前人总结出的最佳实践 主要做权限判断和类型判断
 *
 * 2. |或运算 只有有1位是1就是1
 * 3. &与运算 只有两位都是1才是1 否则就是0
 *
 * 4. 好处
 * COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
 * COMPONENT = 1 << 2 | 1 << 3
 * COMPONENT = 00000010 | 00000100 = 00000110
 *
 * 当我们在创建虚拟节点的时候需要判断传入的type是ELEMENT类型还是组件类型
 * 此时就可以无脑的拿COMPONENT去和其他类型做&运算
 * 如果是FUNCTIONAL_COMPONENT或者STATEFUL_COMPONENT 那么结果的布尔值就是true
 * 如果是其他类型就会返回0 也就是false
 *
 * 一个字节由8个位bit组成 一个bit只能是0或者1 计算机世界就是由0和1组成的
 *
 * 传递进来一个陌生的节点 如何判断它是什么类型？
 * 直接将这个节点的ShapeFlag取出来 和 COMPONENT进行按位与 & 全1才是1
 * 那么00000110 和任何类型进行与运算 前面五位和最后一位一定是0 只有那两位是1的类型才会是1
 * 观察发现除了FUNCTIONAL_COMPONENT和STATEFUL_COMPONENT和COMPONENT进行按位与会返回不为0的值 其他都是0
 *
 */
export const enum ShapeFlags {
  ELEMENT = 1, // 元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 表示00000001=> 00000010 十进制的2 代表函数组件 无状态组件
  STATEFUL_COMPONENT = 1 << 2, // 表示00000001=> 00000100 十进制的4 代表有状态组件
  TEXT_CHILDREN = 1 << 3, // 表示00000001=> 00001000 十进制的8 代表文本节点
  ARRAY_CHILDREN = 1 << 4, // 表示00000001=> 00010000 十进制的16 代表子节点是数组
  SLOTS_CHILDREN = 1 << 5, // 表示00000001=> 00100000 十进制的32 代表插槽节点
  TELEPORT = 1 << 6, // 表示00000001=> 01000000 十进制的64 代表TELEPORT内置传送组件
  SUSPENSE = 1 << 7, // 表示00000001=> 10000000 十进制的128 代表SUSPENSE内置组件
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 表示00000001=> 100000000 十进制的256 代表需要keep-alive的节点
  COMPONENT_KEPT_ALIVE = 1 << 9, // 表示00000001=> 1000000000 十进制的512
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 表示00000110
}
