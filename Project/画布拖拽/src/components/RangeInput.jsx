import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {
    start: Number | String,
    end: Number | String,
  },
  emits: ["update:start", "update:end"],

  setup(props, ctx) {
    const start = computed({
      get() {
        return props.start;
      },
      set(newValue) {
        ctx.emit("update:start", newValue);
      },
    });

    const end = computed({
      get() {
        return props.end;
      },
      set(newValue) {
        ctx.emit("update:end", newValue);
      },
    });

    return () => {
      return (
        <div class="range-input">
          <input type="text" v-model={start.value}></input>
          <span>~</span>
          <input type="text" v-model={end.value} />
        </div>
      );
    };
  },
});
