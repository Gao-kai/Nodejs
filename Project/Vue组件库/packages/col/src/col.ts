import { computed, defineComponent, h, inject } from "vue";

export default defineComponent({
  name: "GCol",
  props: {
    tag: {
      type: String,
      default: "div",
    },
    span: {
      type: Number,
      default: 24,
    },
    offset: {
      type: Number,
      default: 0,
    },
  },
  /**
   * g-row
   *   div
   *    g-col
   */
  setup(props, { attrs, slots, emit, expose }) {
    const gRowGutter = inject("gRowGutter", 0);

    const colClass = computed(() => {
      const classList = [];
      // 方便后续类型推断
      const pos = ["span", "offset"] as const;
      pos.forEach((item) => {
        const size = props[item];
        if (typeof size === "number" && size > 0) {
          // 形成一个BEM的classname g-col-span-12 或者 g-col-offset-6
          classList.push(`g-col-${item}-${size}`);
        }
      });
      return ["g-col", ...classList];
    });

    const colStyles = computed(() => {
      if (gRowGutter) {
        return {
          paddingLeft: gRowGutter / 2 + "px",
          paddingRight: gRowGutter / 2 + "px",
        };
      }
      return {};
    });

    console.log(colStyles.value);

    return () =>
      h(
        props.tag,
        {
          // 在vue模板中会自动解包 在render函数中必须自己解包
          class: colClass.value,
          style: colStyles.value,
        },
        slots.default?.()
      );
  },
});
