import Icon from "./src/icon.vue";
import { App } from "vue";

Icon.install = function (app: App): void {
  app.component(Icon.name, Icon);
};

export default Icon;
