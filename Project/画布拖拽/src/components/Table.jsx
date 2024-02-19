import {
  ElButton,
  ElDialog,
  ElInput,
  ElTable,
  ElTableColumn,
} from "element-plus";
import { cloneDeep } from "lodash";
import { defineComponent, h, reactive, render } from "vue";

const TableDialog = defineComponent({
  name: "CustomTableDialog",
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
      editData: [], // 确认的时候要给外面渲染的数据
    });

    ctx.expose({
      showDialog(options) {
        state.visible = true;
        // 每次show都刷新options 因为只有第一次调用$dialog的时候组件的props会接受到值
        // 后续show的时候不会接受不到新的props.options
        state.options = options;
        // 需要把已经存放的选项回显出来
        state.editData = cloneDeep(options.data);
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
        state.options.onConfirm(state.editData);
      }
    };

    const onAdd = () => {
      state.editData.push({});
    };

    const onReset = () => {
      state.editData = cloneDeep(state.options.data);
    };

    const onDelete = (row, index) => {
      state.editData.splice(index, 1);
    };

    return () => {
      return (
        <ElDialog v-model={state.visible} title={state.options.title}>
          {{
            default: () => {
              return (
                <>
                  <ElButton type="primary" onClick={onAdd}>
                    添加
                  </ElButton>
                  <ElButton type="info" onClick={onReset}>
                    重置
                  </ElButton>

                  <ElTable data={state.editData}>
                    <ElTableColumn type="index"></ElTableColumn>

                    {state.options.config.table.options.map((item, index) => {
                      return (
                        <ElTableColumn label={item.label}>
                          {{
                            default: ({ row }) => {
                              return (
                                <ElInput v-model={row[item.field]}></ElInput>
                              );
                            },
                          }}
                        </ElTableColumn>
                      );
                    })}

                    <ElTableColumn label="操作">
                      {{
                        default: ({ row, column, $index }) => {
                          return (
                            <ElButton
                              type="danger"
                              onClick={() => onDelete(row, $index)}
                            >
                              删除
                            </ElButton>
                          );
                        },
                      }}
                    </ElTableColumn>
                  </ElTable>
                </>
              );
            },
            footer: () => {
              return (
                <>
                  <ElButton type="danger" onClick={onCancle}>
                    取消
                  </ElButton>
                  <ElButton type="primary" onClick={onConfirm}>
                    确定
                  </ElButton>
                </>
              );
            },
          }}
        </ElDialog>
      );
    };
  },
});

let vNode;
export function $table(options) {
  // 只有第一次走这里 创建虚拟节点和挂载
  if (!vNode) {
    const el = document.createElement("div");
    /* 
        h函数
        第一个参数既可以是一个字符串 (用于原生元素) 也可以是一个 Vue 组件定义。
        第二个参数是要传递的 prop，第三个参数是子节点。
        返回一个虚拟 DOM 节点 (vnode)
    */
    vNode = h(TableDialog, { options });

    /*  render函数用于将一个vNode渲染到挂载目标el上 */
    render(vNode, el);

    // 最后再将el渲染到dom上
    document.body.appendChild(el);
  }

  // 后续每一次调用$dialog方法的时候就直接基于组件暴露的方法控制显示与隐藏
  const { showDialog } = vNode.component.exposed;
  showDialog(options);
}
