// ts文件默认是不认识.vue文件的
import Checkbox from "./src/checkbox.vue";
import { App } from "vue";

Checkbox.install = function (app: App): void {
  app.component("G-CheckBox", Checkbox);
};

export default Checkbox;
