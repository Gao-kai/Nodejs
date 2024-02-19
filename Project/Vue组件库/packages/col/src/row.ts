import { computed, defineComponent, h, type PropType, provide } from "vue";

/**
 * 类型定义
 */
type IRowAlignType = "top" | "middle" | "bottom";
type IRowJustifyType =
  | "start"
  | "end"
  | "center"
  | "space-around"
  | "space-between"
  | "space-evenly";

export default defineComponent({
  name: "GRow",
  props: {
    tag: {
      type: String,
      default: "div",
    },
    gutter: {
      type: Number,
      default: 0,
    },
    align: {
      type: String as PropType<IRowAlignType>,
      default: "middle",
    },
    justify: {
      type: String as PropType<IRowJustifyType>,
      default: "start",
    },
  },
  /**
   * Col Row组件是非常适合用render方法来写的
   */
  setup(props, { attrs, slots, emit, expose }) {
    provide("gRowGutter", props.gutter);

    const rowClass = computed(() => {
      return [
        "g-row",
        props.justify !== "start" ? `is-justify-${props.justify}` : "",
      ];
    });

    const rowStyle = computed(() => {
      if (props.gutter) {
        return {
          marginLeft: -(props.gutter / 2) + "px",
          marginRight: -(props.gutter / 2) + "px",
        };
      }
    });

    return () =>
      h(
        props.tag,
        {
          class: rowClass.value,
          style: rowStyle.value,
        },
        slots.default?.()
      );
  },
});
