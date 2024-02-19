# 前置知识

1. lerna
2. monorepo
3.

# 目标

1. 组件库采用 monorepo 管理
   这样做的好处是可以将每一个组件库的组件分开去构建打包和发布，在使用的时候可以按需只使用某一个包
   用户去下载的时候可以知道每一个包的安装量 可以进行分析

```

```

# 组件库的打包格式

1. UMD
   整个打包 只能用 umd 格式 浏览器直接引入
   直接通过浏览器的 HTML 标签导入 Element Plus，然后就可以使用全局变量 ElementPlus 了。

```html
<head>
  <!-- Import style -->
  <link
    rel="stylesheet"
    href="//cdn.jsdelivr.net/npm/element-plus/dist/index.css"
  />
  <!-- Import Vue 3 -->
  <script src="//cdn.jsdelivr.net/npm/vue@3"></script>
  <!-- Import component library -->
  <script src="//cdn.jsdelivr.net/npm/element-plus"></script>
</head>
```

2. ES Module
3. 组件按需加载 按需打包
   按需加载的前提是组件库的作者将每一个组件单独进行了分包和打包
   bable-import-plugin 才可以实现按需导入

# 组件库源代码不依赖与样式

样式通过 theme-chalk 来单独打包
