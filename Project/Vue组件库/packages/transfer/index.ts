// ts文件默认是不认识.vue文件的
import Transfer from "./src/transfer.vue";
import { App } from "vue";

Transfer.install = function (app: App): void {
  app.component(Transfer.name, Transfer);
};

export default Transfer;
