/**
 * 方便用户可以直接以下面的方式全局注册组件
 * Vue.use(GUI)
 * 这里的GUI就是导出的包含install的函数
 * 执行use方法会调用此函数
 * 会循环遍历当前@g-ui作用域空间下的所有组件
 */
import { App } from "vue";

/* 导入所有组件 这里可以使用require.context */
import Icon from "@g-ui/icon";
import Button from "@g-ui/button";
import ButtonGroup from "@g-ui/button-group";
import Row from "@g-ui/row";
import Col from "@g-ui/col";
import Checkbox from "@g-ui/checkbox";
import CheckboxGroup from "@g-ui/checkbox-group";
import Transfer from "@g-ui/transfer";
import GMessage from "@g-ui/message";

const components = [
  Button,
  Icon,
  ButtonGroup,
  Row,
  Col,
  Checkbox,
  CheckboxGroup,
  Transfer,
];

const plugins = [GMessage];

/* 循环注册为全局组件 */
const install = (app: App) => {
  const list = [...components, ...plugins];

  list.forEach((component) => {
    // app.component(component.name, component);
    app.use(component);
  });
};
export default {
  install, // 导出install方法
};
