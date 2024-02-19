import { defineComponent, inject } from "vue";

export default defineComponent({
  name: "EditorPreview",
  props: {
    previewData: {
      type: Object,
    },
  },
  emits: ["startDrag"],
  setup(props) {
    const registerConfig = inject("registerConfig");
    const componentKey = props.previewData.key;
    const component = registerConfig.componentMap.get(componentKey);
    const ComponentPreview = component.preview();

    return () => {
      return (
        <div class="editor-preview" draggable>
          <div class="editor-preview-label">{component.label}</div>
          <div class="editor-preview-content">{ComponentPreview}</div>
        </div>
      );
    };
  },
});
