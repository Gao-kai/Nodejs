export function patchAttr(el, key, nextValue) {
  if (!nextValue) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
}
