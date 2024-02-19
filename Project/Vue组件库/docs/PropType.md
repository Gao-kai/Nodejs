# PropType<T>

1. 功能
   用于在用运行时 props 声明时给一个 prop 标注更复杂的类型定义。

```ts
import type { PropType } from "vue";

interface Book {
  title: string;
  author: string;
  year: number;
}

export default {
  props: {
    book: {
      // 提供一个比 `Object` 更具体的类型
      type: Object as PropType<Book>,
      required: true,
    },
  },
};
```

# ExtractPropTypes<T>

1. 功能
   从运行时的 props 选项对象中提取 props 类型，提取到的类型是面向内部的，也就是说组件接收到的是解析后的 props。

2. 注意
   boolean 类型的 props
   带有默认值的 props
   总是一个定义的值，即使它们不是必需的。

3. 示例

```ts
// 这里定义了一个组件的props选项的类型接口
const propsOptions = {
  foo: String,
  bar: Boolean,
  baz: {
    type: Number,
    required: true,
  },
  qux: {
    type: Number,
    default: 1,
  },
} as const;

// 提取
type Props = ExtractPropTypes<typeof propsOptions>;

// {
//   foo?: string,
//   bar: boolean,
//   baz: number,
//   qux: number
// }
```

# ComponentCustomOptions

1. 功能
   用来扩展组件选项类型以支持自定义选项。

2. 示例

```ts
import { Route } from "vue-router";

declare module "vue" {
  interface ComponentCustomOptions {
    beforeRouteEnter?(to: any, from: any, next: () => void): void;
  }
}
```

3. 注意
   类型扩展必须被放置在一个模块 .ts 或 .d.ts 文件中。
