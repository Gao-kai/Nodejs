import { patchClass } from "./modules/class";
import { patchStyle } from "./modules/style";
import { patchAttr } from "./modules/attrs";
import { patchEvent } from "./modules/events";

const nativeOnRE = /^on[a-z]/;
/**
 * @description 包含一系列的属性更新操作
 */
export const patchProp = (el, key, prevValue, nextValue) => {
  switch (key) {
    case "class":
      patchClass(el, nextValue);
      break;
    case "style":
      patchStyle(el, prevValue, nextValue);
      break;
    default:
      // 如果是事件
      if (nativeOnRE.test(key)) {
        patchEvent(el, key, prevValue, nextValue);
      } else {
        // 如果是dom属性
        patchAttr(el, key, nextValue);
      }
      // 如果是元素属性
      break;
  }
};
