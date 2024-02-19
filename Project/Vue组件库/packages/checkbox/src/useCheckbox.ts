import { WritableComputedRef, computed, getCurrentInstance, inject } from "vue";
import { type ICheckboxProps, type ICheckboxGroupProvide } from "./types";

function useCheckboxGroup() {
  /* 
    1. inject第一个参数是key
    2. 第二个参数是如果key匹配不到的默认值
    3. 可以传递泛型
  */
  const GChekboxGroupInject = inject<ICheckboxGroupProvide>(
    "GChekboxGroup",
    {}
  );
  const isGroup = GChekboxGroupInject.name === "GChekboxGroup";
  return {
    isGroup,
    GChekboxGroupInject,
  };
}

function useModel(props: ICheckboxProps) {
  const { emit } = getCurrentInstance();
  const { isGroup, GChekboxGroupInject } = useCheckboxGroup();

  console.log(isGroup, GChekboxGroupInject);

  const model = computed({
    get() {
      // 如果是用在group内部 那么取group inject进来的那个modelValue 这个modelValue是一个数组
      // input的type为chekbox时候 是可以绑定数组的 这是vue内部为了方便开发提供的内置built in功能
      if (isGroup) {
        return GChekboxGroupInject?.modelValue.value;
      } else {
        // 如果自己单独使用 那么就用自己的modelvalue
        return props.modelValue;
      }
    },
    set(newValue) {
      if (isGroup) {
        // 在group中使用 调用group的更新方法
        GChekboxGroupInject?.changeEvent(newValue);
      } else {
        // 自己使用
        emit("update:modelValue", newValue);
      }
    },
  });
  return model;
}

function useCheckboxStatus(
  props: ICheckboxProps,
  model: WritableComputedRef<any>
) {
  const isChecked = computed(() => {
    // 如果用在group里面 那么此时model应该是属猪 以lable为选中的标识
    if (Array.isArray(model.value)) {
      return model.value.includes(props.label);
    } else {
      // 自己用那么是否选中取决于props中的布尔值
      return model.value;
    }
  });

  return isChecked;
}

function useEvent() {
  /* 这一句必须放在顶级 */
  const { emit } = getCurrentInstance();

  const inputChange = ($event: InputEvent) => {
    const target = $event.target as HTMLInputElement;
    /* 用户传递的checked有可能是字符= */
    const changeValue = target.checked ? true : false;
    emit("change", changeValue);
  };

  return inputChange;
}

export function useCheckbox(props: ICheckboxProps) {
  const model = useModel(props);
  const isChecked = useCheckboxStatus(props, model);
  const inputChange = useEvent();

  return {
    model,
    isChecked,
    inputChange,
  };
}
