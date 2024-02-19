/**
 * @description 检测对象是否包含属性prop 原型链的不包含在内
 * @param {*} obj
 * @param {*} prop
 * @returns
 */
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = {
  hasOwnProperty,
};
