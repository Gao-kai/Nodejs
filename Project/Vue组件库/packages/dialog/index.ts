// ts文件默认是不认识.vue文件的
import Dialog from "./src/dialog.vue";
import { App } from "vue";

Dialog.install = function (app: App): void {
  app.component(Dialog.name, Dialog);
};

export default Dialog;
