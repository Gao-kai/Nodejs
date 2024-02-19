/**
 * 之前没有 现在有 取nextClass
 * 之前有 现在没有 nextClass为null 删除el删的所有class
 * 之前有 现在有 取nextClass
 * @param el
 * @param classValue
 */
export function patchClass(el, classValue) {
  if (!classValue) {
    classValue = "";
  }

  el.className = classValue;
}
