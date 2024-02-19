// ts文件默认是不认识.vue文件的
import CheckboxGroup from "../checkbox/src/checkbox-group.vue";
import { App } from "vue";

CheckboxGroup.install = function (app: App): void {
  app.component("GCheckboxGroup", CheckboxGroup);
};

export default CheckboxGroup;
