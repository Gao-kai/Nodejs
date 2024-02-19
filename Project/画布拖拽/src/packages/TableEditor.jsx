import { ElButton, ElTag } from "element-plus";
import { cloneDeep } from "lodash";
import { computed, defineComponent } from "vue";
import { $table } from "../components/Table";

export default defineComponent({
  props: {
    propConfig: {
      type: Object,
    },
    modelValue: {
      type: Array,
    },
  },
  emits: ["update:modelValue"],

  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue || [];
      },
      set(newValue) {
        ctx.emit("update:modelValue", cloneDeep(newValue));
      },
    });

    const handleClick = () => {
      $table({
        title: "下拉框选项",
        config: props.propConfig,
        data: data.value,
        onConfirm(newValue) {
          data.value = newValue;
        },
      });
    };

    return () => {
      return (
        <>
          <div>
            <ElButton onClick={() => handleClick()}>添加选项</ElButton>
          </div>

          {data.value.length
            ? data.value.map((item) => {
                return <ElTag>{item[props.propConfig.table.key]}</ElTag>;
              })
            : null}
        </>
      );
    };
  },
});
