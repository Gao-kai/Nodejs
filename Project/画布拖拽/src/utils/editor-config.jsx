import { ElButton, ElInput, ElOption, ElSelect } from "element-plus";
import RangeInput from "../components/RangeInput";

function createEditorConfig() {
  const componentList = [];
  const componentMap = new Map();

  const register = (component) => {
    componentList.push(component);
    componentMap.set(component.key, component);
  };

  return {
    componentList,
    componentMap,
    register,
  };
}

export const registerConfig = createEditorConfig();

const createInputProp = (label) => ({
  label,
  type: "input",
});

const createColorProp = (label) => ({
  label,
  type: "color",
});

const createSelectProp = (label, options) => ({
  label,
  type: "select",
  options,
});

const createTableProp = (label, table) => ({
  label,
  type: "table",
  table,
});

registerConfig.register({
  label: "文本",
  preview: () => "这是一段预览文本",
  render: ({ blockProps }) => {
    return (
      <span style={{ color: blockProps.color, fontSize: blockProps.size }}>
        {blockProps.text || "这是一个渲染文本"}
      </span>
    );
  },
  key: "text",
  // props中保存着如何修改这个文本框的配置
  // 每一个key的意思表示渲染出来的el组件的取值key
  // key对应的value是一个对象 对象中的type决定了渲染什么el组件
  props: {
    text: createInputProp("文本内容"),
    color: createColorProp("文本颜色"),
    size: createSelectProp("文本大小", [
      { label: "14px", value: "14px" },
      { label: "16px", value: "16px" },
      { label: "20px", value: "20px" },
    ]),
  },
});

registerConfig.register({
  label: "按钮",
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({ blockProps, blockSize }) => {
    return (
      <ElButton
        size={blockProps.size}
        type={blockProps.type}
        style={{
          color: blockProps.color,
          width: blockSize.width + "px",
          height: blockSize.height + "px",
        }}
      >
        {blockProps.text || "渲染按钮"}
      </ElButton>
    );
  },
  key: "button",
  resize: {
    width: true,
    height: true,
  },
  props: {
    text: createInputProp("按钮内容"),
    color: createColorProp("按钮颜色"),
    type: createSelectProp("按钮类型", [
      { label: "基础", value: "primary" },
      { label: "成功", value: "success" },
      { label: "警告", value: "warning" },
      { label: "文本", value: "text" },
      { label: "错误", value: "danger" },
    ]),
    size: createSelectProp("按钮类型", [
      { label: "默认", value: "" },
      { label: "小", value: "small" },
      { label: "中等", value: "default" },
      { label: "极小", value: "mini" },
    ]),
  },
});

registerConfig.register({
  label: "输入框",
  resize: {
    width: true,
  },
  preview: () => <ElInput placeholder="预览输入框"></ElInput>,
  render: ({ blockModel, blockSize }) => (
    <ElInput
      style={{
        width: blockSize.width + "px",
      }}
      placeholder="渲染输入框"
      {...blockModel.default}
    ></ElInput>
  ),
  key: "input",
  model: {
    default: "绑定字段",
  },
});

registerConfig.register({
  label: "范围选择器",
  preview: () => <RangeInput></RangeInput>,
  render: ({ blockModel }) => {
    console.log(blockModel);
    return (
      <RangeInput
        {...{
          start: blockModel.start.modelValue,
          "onUpdate:start": blockModel.start["onUpdate:modelValue"],
          end: blockModel.end.modelValue,
          "onUpdate:end": blockModel.end["onUpdate:modelValue"],
        }}
      ></RangeInput>
    );
  },
  key: "range",
  model: {
    start: "开始字段",
    end: "结束时间",
  },
});

registerConfig.register({
  label: "下拉选择框",
  key: "select",
  preview: () => <ElSelect></ElSelect>,
  render: ({ blockProps, blockModel }) => {
    return (
      <ElSelect {...blockModel.default}>
        {(blockProps.options || []).map((item) => {
          return (
            <ElOption
              label={item.label}
              value={item.value}
              key={item.label}
            ></ElOption>
          );
        })}
      </ElSelect>
    );
  },
  props: {
    options: createTableProp("下拉选项", {
      options: [
        { label: "显示值", field: "label" },
        { label: "绑定值", field: "value" },
      ],
      key: "label",
    }),
  },
  model: {
    default: "绑定字段",
  },
});
