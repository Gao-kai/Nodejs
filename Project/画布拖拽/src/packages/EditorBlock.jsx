import { ref, defineComponent, computed, inject, onMounted, watch } from "vue";
import BlockResize from "./BlockResize";

export default defineComponent({
  name: "EditorBlock",
  props: {
    blockData: {
      type: Object,
    },
    formData: {
      type: Object,
    },
  },
  setup(props) {
    const blockStyle = computed(() => {
      return {
        top: props.blockData.top + "px",
        left: props.blockData.left + "px",
        zIndex: props.blockData.zIndex,
      };
    });

    const editorBlockRef = ref(null);
    onMounted(() => {
      const { offsetWidth, offsetHeight } = editorBlockRef.value;
      // 只有第一次渲染的时候如果有needCenter属性 说明这个元素需要居中
      if (props.blockData.needCenter) {
        props.blockData.top = props.blockData.top - offsetHeight / 2;
        props.blockData.left = props.blockData.left - offsetWidth / 2;
        // 后续的移动就不再居中了
        props.blockData.needCenter = false;
      }

      props.blockData.width = offsetWidth;
      props.blockData.height = offsetHeight;
    });
    const registerConfig = inject("registerConfig");

    return () => {
      const componentKey = props.blockData.key;
      const componentConfig = registerConfig.componentMap.get(componentKey);

      // 每次渲染都应用最新的block属性 会发生颜色 大小等的变化
      let blockProps = props.blockData.props;

      let blockModel = {};
      // modelKey就是每一个取值的key 也就是defayult end start等
      Object.keys(componentConfig.model || {}).forEach((modelKey) => {
        // bindValueName就是右侧输入的绑定这个值在那个属性上 是formData中的属性
        let bindValueName = props.blockData.model[modelKey];
        blockModel[modelKey] = {
          modelValue: props.formData[bindValueName],
          "onUpdate:modelValue": (newValue) =>
            (props.formData[bindValueName] = newValue),
        };
      });

      let blockSize = {
        width: props.blockData.width,
        height: props.blockData.height,
      };

      let ComponentRender = componentConfig.render({
        blockSize: props.blockData.hasResized ? blockSize : {},
        blockProps,
        blockModel,
      });

      const { width, height } = componentConfig.resize || {};

      console.log(blockProps);

      return (
        <div class="editor-block" style={blockStyle.value} ref={editorBlockRef}>
          {ComponentRender}
          {/*  */}
          {props.blockData.seleted && (width || height) && (
            <BlockResize
              componentConfig={componentConfig}
              blockData={props.blockData}
            ></BlockResize>
          )}
        </div>
      );
    };
  },
});
