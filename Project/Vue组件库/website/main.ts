import { createApp } from "vue";
import App from "./App.vue";

// 可以采用npm导入
import GUI from "g-ui";

// 可以采用umd导入
// import GUI from "../lib/index.js";

// 可以采用ES Module导入
// import GUI from "../lib/index.esm.js";

// 可以按需导入单个组件
// import GIcon from "../lib/icon/index.js";
// import GButton from "../lib/button/index.js";

/* 用户使用组件库的时候导入打包后的css文件 */
// import "theme-chalk/lib/index.css";

/* 开发的时候为了预览 直接调用scss文件 */
import "theme-chalk/src/index.scss";
// 这里可以实现一个组件的官方文档 提供侧边栏
const app = createApp(App);
app.use(GUI);

// app.use(GIcon);
// app.use(GButton);

app.mount("#app");
