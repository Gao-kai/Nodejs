// ts文件默认是不认识.vue文件的
import Button from "./src/button.vue";
import { App } from "vue";

Button.install = function (app: App): void {
  app.component(Button.name, Button);
};

export default Button;
