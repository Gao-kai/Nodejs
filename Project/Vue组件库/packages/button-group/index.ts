// ts文件默认是不认识.vue文件的
import ButtonGroup from "../button/src/button-group.vue";
import { App } from "vue";

ButtonGroup.install = function (app: App): void {
  app.component(ButtonGroup.name, ButtonGroup);
};

export default ButtonGroup;
