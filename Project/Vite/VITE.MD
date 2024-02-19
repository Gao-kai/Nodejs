# Vite

## 安装

1. npm

```js
npm i create-vite -g
create-vite projectName --template=xxx
```

2. npx

```js
npx create-vite projectName
```

3. npm init vite projectName
4. npm create vite projectName

```js
// 安装 会自动在前面拼接create-
npx create-vite projectName
```

## create-react-app

1. npm

```js
npm i  create-react-app  -g
 create-react-app  projectName --template=xxx
```

2. npx

```js
npx create-react-app projectName
```

3. npm init react-app projectName
4. npm create react-app projectName

```js
// 安装 会自动在前面拼接create-
npx create-react-app projectName
```

## 问题

1.  .vue 文件也可以加载？
    在后端将.vue 文件进行编译
    浏览器执行请求 需要 type=module

2.  dev 的时候启动速度为什么这么快？

3.  用到什么组件就加载什么组件 按需加载？按需编译？

4.  没有任何打包过程

5.  type=module
    表示这个 script 文件是一个 es module 就可以用 import 和 export 语法

```js
// 源码
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

createApp(App).mount("#app");

// 浏览器type=module拿到的文件
import { createApp } from "/node_modules/.vite/deps/vue.js?v=485ca441";
import "/src/style.css";
import App from "/src/App.vue";

createApp(App).mount("#app");
```

打包前后有差别 vite 就在中间做了这个转化

5. 浏览器如何直接加载第三方模块
6. 浏览器如何直接加载.vue 文件
7. es module 规定 原生的 es 模块中的 import 的本质就是向服务器请求静态资源

## Vite 核心

1. 可以帮助我们创建项目模板 也就是 cli 的功能
   基于 create-vite 这个 npm 包提供的能力
   可以快速创建基于 vue 或者 react 项目的代码模板

2. 开发阶段 可以提供开发服务器和热更新
   基于浏览器的 type=module
   和 fecth
   esbuild

3. 打包阶段 可以提供打包服务
   基于 rollup 打包

所以涵盖了项目开发的各个阶段

## 插件注册顺序

读取 main.js

- serveStaticPlugin 读取到资源进行请求
- 发现 vue
- 重写为/modeuls/vue

读取 /modeuls/vue

- serveStaticPlugin 读取到资源 vue 源码 里面又有资源 lodash
- 发现 vue
- 重写为/modeuls/lodash

读取 /modeuls/lodash

- serveStaticPlugin 读取到 lodash 源码 js 文件
-

main.js

module-Rewrite-Plugin 执行
向下 await next();
moduleResolvePlugin 执行

一个静态资源请求到来：

1. 先调用 moduleRewritePlugin 此时会 await 先向下执行
2. 然后执行 moduleResolvePlugin 此时会先判断请求路径中是否包含/@modules/xxx 的路径
3. 如果没有 直接执行下一步 也就是静态资源服务 读取服务器上资源返回即可
4. 如果有 那么需要将/@modules/xxx 中取出 xxx 这个包名
5. 建立一个 mapping 映射 这里只考虑 vue 取到 vue 在 nodemodule 中的真实 js 文件
6. 将这个 js 文件 read 出来 挂载到 ctx 的 body 上 然后 over
7. 回到第一步 执行路径重写
8. 将上一步的 body 取出来 进行 ast 解析 获取到哪些 import 的语句 再次重写为@modules/xxx 的语句
9. 给浏览器返回
10. 请求结束
11. 注意最后一个插件就是静态服务 找的到就返回 找不到就 await next()

## Vite 热更新原理

服务端创建一个 websockets 监控文件变化 一旦文件变化发送消息通知浏览器
浏览器接收到变化文件的路径 在参数中携带上时间戳 重新发一次请求
然后重新解析拿到最新的 render 方法替换掉旧的 render
然后页面重新 rerender
