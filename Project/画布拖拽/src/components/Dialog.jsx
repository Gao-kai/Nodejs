import { ElButton, ElDialog, ElInput } from "element-plus";
import { defineComponent, h, reactive, render } from "vue";

const DialogComponent = defineComponent({
  name: "CustomDialogComponent",
  props: {
    options: {
      type: Object,
    },
  },
  setup(props, ctx) {
    console.log(props);

    const state = reactive({
      visible: false,
      options: props.options,
    });

    ctx.expose({
      showDialog(options) {
        state.visible = true;
        // 每次show都刷新options 因为只有第一次调用$dialog的时候组件的props会接受到值
        // 后续show的时候不会接受不到新的props.options
        state.options = options;
      },
      closeDialog() {
        state.visible = false;
      },
    });

    const onCancle = () => {
      state.visible = false;
    };

    const onConfirm = () => {
      state.visible = false;
      if (state.options.onConfirm) {
        state.options.onConfirm(state.options.content);
      }
    };

    return () => {
      return (
        <ElDialog v-model={state.visible} title={state.options.title}>
          {{
            default: () => {
              return (
                <ElInput
                  type="textarea"
                  rows={15}
                  v-model={state.options.content}
                ></ElInput>
              );
            },
            footer: () => {
              return (
                state.options.showFooter && (
                  <>
                    <ElButton type="danger" onClick={onCancle}>
                      取消
                    </ElButton>
                    <ElButton type="primary" onClick={onConfirm}>
                      确定
                    </ElButton>
                  </>
                )
              );
            },
          }}
        </ElDialog>
      );
    };
  },
});

let vNode;
export function $dialog(options) {
  // 只有第一次走这里 创建虚拟节点和挂载
  if (!vNode) {
    const el = document.createElement("div");
    /* 
        h函数
        第一个参数既可以是一个字符串 (用于原生元素) 也可以是一个 Vue 组件定义。
        第二个参数是要传递的 prop，第三个参数是子节点。
        返回一个虚拟 DOM 节点 (vnode)
    */
    vNode = h(DialogComponent, { options });

    /*  render函数用于将一个vNode渲染到挂载目标el上 */
    render(vNode, el);

    // 最后再将el渲染到dom上
    document.body.appendChild(el);
  }

  // 后续每一次调用$dialog方法的时候就直接基于组件暴露的方法控制显示与隐藏
  const { showDialog } = vNode.component.exposed;
  showDialog(options);
}
