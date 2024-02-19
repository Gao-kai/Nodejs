import React, { createRef } from "react";
import ReactDOM from "react-dom/client";

import "react-app-polyfill/stable";
import "react-app-polyfill/ie11";
import "react-app-polyfill/ie9";

import "@/index.less";
import "@/styles/fonts.scss";

import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

// import store from "@/views/ReduxDemo/store.js";
// redux
// import store from "@/store/index";

// redux-toolkit
import store from "@/toolkit-store/index";
/* todolist案例阶段 */
// import ToDoList from "./views/Todo/TodoList-Redux.jsx";
import ToDoList from "./views/Todo/TodoList-Redux-Toolkit.jsx";

/* React Hooks */
import UseStateDemo from "./views/Hooks/UseStateDemo";
import UseEffectDemo from "./views/Hooks/UseEffectDemo";
import UseRefDemo from "./views/Hooks/UseRefDemo";
import UseMemoDemo from "./views/Hooks/UseMemoDemo";
import UseCallbackDemo from "./views/Hooks/UseCallbackDemo";
import UseCustomDemo from "./views/Hooks/UseCustomDemo";

/* 组件传值 */
import Vote from "./views/Communication/Vote";
import Provide from "./views/Communication/Provide";

/* css样式方案 */
import ReactJss from "./views/StyleScheme/ReactJss";

/* redux 状态管理 */
import ReduxDemo from "./views/ReduxDemo/Vote";

/* 顶级注入组件 方便再每一个组件中获取到store对象 */
// import ThemeContext from "./themeContext";

/* react-redux */
import { Provider } from "react-redux";
// import { Provider } from "@/redux/react-redux";

/* 网络请求Axios */
import { http } from "@/request/http";

// import "./syntax/decorators.js";

/* mobx */
// import MobxDemo from "./views/mobx/MobxDemo.jsx";
// import "./views/mobx/MobxDemo1.jsx";

/* router V5 */
// import AppV5Router from "./views/V5Router/App.jsx";

/* router V6 */
import AppV6Router from "./views/V6Router/App.jsx";

/* App组件 */
class App extends React.Component {
  render() {
    return (
      <ConfigProvider locale={zhCN}>
        {/* <ToDoList></ToDoList> */}
        {/* <UseStateDemo></UseStateDemo> */}
        {/* <UseEffectDemo></UseEffectDemo> */}
        {/* <UseRefDemo></UseRefDemo> */}
        {/* <UseMemoDemo></UseMemoDemo> */}
        {/* <UseCallbackDemo></UseCallbackDemo> */}
        {/* <UseCustomDemo></UseCustomDemo> */}
        {/* <Vote></Vote> */}
        {/* <Provide></Provide> */}
        {/* <ReactJss></ReactJss> */}
        {/* 
        <ThemeContext.Provider value={store}>
          <ReduxDemo></ReduxDemo>
        </ThemeContext.Provider> */}

        <Provider store={store}>
          {/* <ReduxDemo></ReduxDemo> */}
          {/* <ToDoList></ToDoList> */}
          {/* <MobxDemo></MobxDemo> */}
        </Provider>
      </ConfigProvider>
    );
  }
}

/* 组件挂载 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppV6Router />);
