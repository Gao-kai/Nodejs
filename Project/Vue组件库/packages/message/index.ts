// ts文件默认是不认识.vue文件的
import GMessage from "./src/message";
import { App } from "vue";

// 给GMessage组件上挂载一个install方法 便于vue.use(GUI)的时候统一插件注册 或者app.use(GMessage)
(GMessage as any).install = function (app: App): void {
  app.config.globalProperties.$messgae = GMessage;
};

export { GMessage, GMessage as default };

/**
 * Gmessage的两种用法
 * 1. 用户直接从库中导入GMessage 然后直接调用GMessage()来实现功能 这样子的话有没有install都无所谓
 * 2. 用户按需导入GMessage 然后使用app.use(GMessage) 这样注册插件之后实例上就会多一个$messgae方法 用户通过this.$messgae调用 需要install方法
 * 3. 用户全量导入GUI 然后使用app.use(GUI)  用户通过this.$messgae调用  需要install方法
 */
