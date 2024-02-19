/**
 * @description 深度优先递归遍历ast树
 * @param {*} ast
 * @param {*} param1
 */
function walk(ast, { enter, leave }) {
  visit(ast, null, enter, leave);
}

/**
 *
 * @param {*} node 当前节点
 * @param {*} parent 父节点
 * @param {*} enter 进入钩子
 * @param {*} leave 离开钩子
 */
function visit(node, parent, enter, leave) {
  if (enter) {
    enter.call(null, node, parent);
  }
  // 将所有值不是对象的节点排除 specifiers source保留
  let keys = Object.keys(node).filter((key) => {
    return typeof node[key] === "object";
  });

  keys.forEach((key) => {
    let value = node[key];
    if (Array.isArray(value)) {
      // 递归遍历
      value.forEach((val) => {
        if (val && val.type) {
          visit(val, node, enter, leave);
        }
      });
    } else if (value && value.type) {
      visit(value, node, enter, leave);
    }
  });

  if (leave) {
    leave.call(null, node, parent);
  }
}

module.exports = {
  walk,
};
