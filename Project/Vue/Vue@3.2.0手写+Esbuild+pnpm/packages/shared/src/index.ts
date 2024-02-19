export const isObject = (value: any): boolean => {
  return typeof value === "object" && value !== null;
};

export const isFunction = (value: any): boolean => {
  return typeof value === "function";
};
