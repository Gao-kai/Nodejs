## 幽灵依赖

安装 lodash
lodash 的依赖有 dayjs

我们可以直接导入 dayjs
某一天版本更新
lodash 不用 dayjs 了 变成了 moment.js
此时程序就会报错

如何解决？

默认情况下 pnpm 安装的依赖不会产生幽灵依赖
但是我们开发的时候想用咋办
就搞一个 npmrc 文件 然后配置依赖提升
shamefully-hoist = true
此时安装 vue 就还是经典的样子

```bash
├── @babel
├── @vue
├── csstype
├── estree-walker
├── magic-string
├── nanoid
├── picocolors
├── postcss
├── source-map
├── source-map-js
├── sourcemap-codec
├── to-fast-properties
└── vue

```

## 打包配置

"buildOptions": {
"name": "GGVueReactivity",
"formats": [
"esm-bundler", 用于在浏览器中通过 type=module 应用的
"cjs",
"global"
]
}
每个子包都可以独立打包
指定自定义的脚本

## 删除 node modules

rm -rf node_modules

## pnpm 包 === npx 包

## format 自定义格式

formats 为自定义的打包格式，
esm-bundler 在构建工具中使用的格式、
esm-browser 在浏览器中使用的格式、
cjs 在 node 中使用的格式、
global 立即执行函数的格式

最终的结果就 packages 下的包可以互相引用

## 不同导出不同产物

module.exports 导出的 global 可以直接 GGVueReactivity.xxx
export default 导出的 global 必须 GGVueReactivity.default.xxx
export default

module.exports = {
default:{
xxx:100
}
}

## vue3 最早用 lerna 最后用 pnpm
