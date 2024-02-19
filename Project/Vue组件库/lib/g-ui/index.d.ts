/**
 * 方便用户可以直接以下面的方式全局注册组件
 * Vue.use(GUI)
 * 这里的GUI就是导出的包含install的函数
 * 执行use方法会调用此函数
 * 会循环遍历当前@g-ui作用域空间下的所有组件
 */
import { App } from "vue";
declare const _default: {
    install: (app: App<any>) => void;
};
export default _default;
