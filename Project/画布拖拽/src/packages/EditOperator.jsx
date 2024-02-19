import { defineComponent, inject, reactive, watch } from "vue";
import {
  ElButton,
  ElColorPicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
} from "element-plus";
import { cloneDeep } from "lodash";
import TableEditor from "./TableEditor";

export const EditOperator = defineComponent({
  props: {
    data: {
      type: Object,
    },
    block: {
      type: Object,
    },
    updateContainer: {
      type: Function,
    },
    updateBlock: {
      type: Function,
    },
  },
  setup(props, context) {
    const state = reactive({
      editData: {},
    });

    const reset = () => {
      if (props.block) {
        state.editData = cloneDeep(props.block);
      } else {
        state.editData = cloneDeep(props.data.container);
      }
    };

    const apply = () => {
      if (props.block) {
        props.updateBlock(state.editData, props.block);
      } else {
        props.updateContainer({ ...props.data, container: state.editData });
      }
    };

    const registerConfig = inject("registerConfig");

    watch(() => props.block, reset, { immediate: true });
    const renderElCpnMap = {
      input: (propName, propConfig) => {
        return <ElInput v-model={state.editData.props[propName]}></ElInput>;
      },
      color: (propName, propConfig) => {
        return (
          <ElColorPicker
            v-model={state.editData.props[propName]}
          ></ElColorPicker>
        );
      },
      select: (propName, propConfig) => {
        return (
          <ElSelect v-model={state.editData.props[propName]}>
            {propConfig.options.map((options) => {
              return (
                <ElOption
                  label={options.label}
                  value={options.value}
                ></ElOption>
              );
            })}
          </ElSelect>
        );
      },
      table: (propName, propConfig) => {
        return (
          <TableEditor
            v-model={state.editData.props[propName]}
            propConfig={propConfig}
          ></TableEditor>
        );
      },
    };

    return () => {
      const renderContent = [];

      if (props.block) {
        // 基于属性渲染
        const componentKey = props.block.key;
        const component = registerConfig.componentMap.get(componentKey);
        const operatorProps = component.props;
        operatorProps &&
          Object.entries(operatorProps).forEach(([propName, propConfig]) => {
            const { type, label } = propConfig;

            renderContent.push(
              <ElFormItem label={label}>
                {renderElCpnMap[type](propName, propConfig)}
              </ElFormItem>
            );
          });

        // 基于model渲染
        const operatorModel = component.model;
        operatorModel &&
          Object.entries(operatorModel).forEach(([modelName, label]) => {
            renderContent.push(
              <ElFormItem label={label}>
                <ElInput v-model={state.editData.model[modelName]}></ElInput>
              </ElFormItem>
            );
          });
      } else {
        // 默认渲染的就是修改画布大小的数据
        const Container = (
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>

            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
          </>
        );
        renderContent.push(Container);
      }

      return (
        <ElForm labelPosition="top">
          {[renderContent]}
          <ElFormItem>
            <ElButton type="primary" onClick={() => apply()}>
              应用
            </ElButton>
            <ElButton onClick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
