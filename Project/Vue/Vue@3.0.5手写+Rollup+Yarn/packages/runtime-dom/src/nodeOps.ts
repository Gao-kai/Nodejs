/**
 * @description 包含一系列的DOM节点操作方法
 */
export const nodeOps = {
  /**
   * 元素操作
   */
  createElement(tagName) {
    return document.createElement(tagName);
  },
  remove(child) {
    let parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  /**
   * 将节点child插入到节点anchor的前面
   * 如果anchor为空 则等同于appendChild插入到末尾
   * @param child
   * @param parent
   * @param anchor
   */
  insert(child, parent, anchor = null) {
    parent.insertBefore(child, anchor);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  querySelector: (selector) => {
    return document.querySelector(selector);
  },
  /**
   * 文本操作
   */
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    node.nodeValue = text;
  },
};
