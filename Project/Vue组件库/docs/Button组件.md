# 事件透传

Vue2 直接给一个组件绑定原生 native 的 dom 事件是不会触发的，必须搭配.native 修饰符才可以
Vue3 直接给一个组件绑定原生 native 的 dom 事件是会触发的，因为会默认给组件的根元素绑定事件，如果给组件内部也绑定了事件，此时也会触发。

## Attributes 继承

“透传 attribute”指的是传递给一个组件，却没有被该组件声明为 props 或 emits 的 attribute 或者 v-on 事件监听器。最常见的例子就是 class、style 和 id。

当一个组件以单个元素为根作渲染时，透传的 attribute 会自动被添加到根元素上

1. 对 class 和 style 的合并
2. v-on 监听器继承
   click 监听器会被添加到 <MyButton> 的根元素，即那个原生的 <button> 元素之上。当原生的 <button> 被点击，会触发父组件的 onClick 方法。同样的，如果原生 button 元素自身也通过 v-on 绑定了一个事件监听器，则这个监听器和从父组件继承的监听器都会被触发。
3. 深层组件继承

有些情况下一个组件会在根节点上渲染另一个组件
此时 <MyButton> 接收的透传 attribute 会直接继续传给 <BaseButton>。

## 禁用 Attributes 继承

1. 在组件选项中设置 inheritAttrs: false。
2. 从 3.3 开始你也可以直接在 <script setup> 中使用 defineOptions：

### 禁用 Attributes 继承场景

attribute 需要应用在根节点以外的其他元素上。通过设置 inheritAttrs 选项为 false，你可以完全控制透传进来的 attribute 被如何使用。

1.  访问属性
    直接在模板中$attrs['foo-bar'] $attrs.onClick

2.  设定 inheritAttrs: false 和使用 v-bind="$attrs" 来实现
3.  没有参数的 v-bind 会将一个对象的所有属性都作为 attribute 应用到目标元素上。

## 多根节点

和单根节点组件有所不同，有着多个根节点的组件没有自动 attribute 透传行为。如果 $attrs 没有被显式绑定，将会抛出一个运行时警告。

由于 Vue 不知道要将 attribute 透传到哪里，所以会抛出一个警告。

## 在 JavaScript 中访问透传 Attributes

1. 使用 useAttrs() API 来访问一个组件的所有透传 attribute：
   const attrs = useAttrs()

2. attrs 会作为 setup() 上下文对象的一个属性暴露
   setup(props, ctx) {
   // 透传 attribute 被暴露为 ctx.attrs
   console.log(ctx.attrs)
   }

这里的 attrs 对象总是反映为最新的透传 attribute，但它并不是响应式的 (考虑到性能因素)。你不能通过侦听器去监听它的变化。如果你需要响应性，该怎么办？

1. 可以使用 prop
2. 可以使用 onUpdated() 使得在每次更新时结合最新的 attrs 执行副作用。
