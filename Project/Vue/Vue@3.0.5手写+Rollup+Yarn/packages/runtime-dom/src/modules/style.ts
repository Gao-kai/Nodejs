/**
 * 1. 新的么有 说明样式不存在了 移除掉就好了
 * 2. 新的有 旧的也有
 * @param el
 * @param prevStyle 旧的style对象
 * @param nextStyle 新的style对象
 */
export function patchStyle(el, prevStyle, nextStyle) {
  // {color:'red',height:"10px"} => ""
  if (!nextStyle) {
    // 操作DOM的地方
    el.removeAttribute("style");
  } else {
    // 旧的style对象有 但是新的style对象中没有
    // {color:'red',height:"10px"} => {height:"10px"}
    if (prevStyle) {
      for (const key in prevStyle) {
        if (nextStyle[key] == null) {
          // 操作DOM的地方
          el.style[key] = "";
        }
      }
    }

    // 嘴周将新的style的属性无脑放到el上
    for (const key in nextStyle) {
      // 操作DOM的地方
      el.style.setProperty(key, nextStyle[key]);
    }
  }
}
