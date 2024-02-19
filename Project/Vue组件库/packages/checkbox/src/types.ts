import { ComputedRef } from "vue";

export interface ICheckboxProps {
  indeterminate?: boolean; // 半选
  checked?: boolean; // 初始选中效果
  name?: string; // 原生的name
  disabled?: boolean; // 禁用
  label?: boolean | string | number; // group中使用
  modelValue?: boolean | string | number; // 绑定checkbox的值
}

export interface ICheckboxGroupProps {
  modelValue?: Array<number> | string[];
  disabled?: boolean;
  label?: string;
}

export interface ICheckboxGroupProvide {
  modelValue?: ComputedRef;
  changeEvent?: (val: any) => void;
  name?: string;
}
