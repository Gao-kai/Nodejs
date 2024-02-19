export * from "./shapeFlags";

export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string =>
  objectToString.call(value);
export const hasOwnProperty = Object.hasOwnProperty;

export const isObject = (value: any): boolean => {
  return typeof value === "object" && value !== null;
};

export const isPlainObject = (val: unknown) =>
  toTypeString(val) === "[object Object]";

export const isFunction = (value: any): boolean => {
  return typeof value === "function";
};

export const isArray = Array.isArray;

export const isMap = (val: unknown) => toTypeString(val) === "[object Map]";

export const isSET = (val: unknown) => toTypeString(val) === "[object Set]";

export const isString = (val: unknown) =>
  toTypeString(val) === "[object String]";

export const isNumber = (val: unknown) =>
  toTypeString(val) === "[object Number]";

export const isBoolean = (val: unknown) =>
  toTypeString(val) === "[object Boolean]";

export const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

/**
 * @description 判断传入的属性名是否是一个数字类型的字符串 比如'0' '1' '10'都符合 但是'-1' 'name' 'NaN'不符合
 * @param key
 * @returns
 */
export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== "NaN" &&
  key[0] !== "-" &&
  "" + parseInt(key as string, 10) === key;
