# defineComponent

1. 作用
   在定义 Vue 组件时提供类型推导的辅助函数。

2. 参数

```ts
function defineComponent(component: ComponentOptions): ComponentConstructor;
```

3. 详解
   第一个参数是一个组件选项对象。返回值将是该选项对象本身，因为该函数实际上在运行时没有任何操作，仅用于提供类型推导。

   注意返回值的类型有一点特别：它会是一个构造函数类型**ComponentConstructor**，它的实例类型是根据选项推断出的组件实例类型。这是为了能让该返回值在 TSX 中用作标签时提供类型推导支持。

4. 返回值的类型体操
   你可以像这样从 **defineComponent()** 的返回类型中提取出一个组件的实例类型 (与其选项中的 this 的类型等价)：

```ts
const Foo = defineComponent(/* ... */);

type FooInstance = InstanceType<typeof Foo>;
```

typeof Foo 会计算出 Foo 变量的类型
InstanceType 会进一步计算出当前 Foo 组件的类型

5. webpack Treeshaking 的注意事项
   因为 defineComponent() 是一个函数调用，所以它可能被某些构建工具认为会产生副作用，如 webpack。即使一个组件从未被使用，也有可能不被 tree-shake。

为了告诉 webpack 这个函数调用可以被安全地 tree-shake，我们可以在函数调用之前添加一个 /_#**PURE**_/ 形式的注释：

```js
export default /_#**PURE**_/ defineComponent(/_ ... _/)
```

请注意，如果你的项目中使用的是 Vite，就不需要这么做，因为 Rollup (Vite 底层使用的生产环境打包工具) 可以智能地确定 defineComponent() 实际上并没有副作用，所以无需手动注释。
