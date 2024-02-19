import { ref, defineComponent, computed, h, resolveComponent } from "vue";
import EditorBlock from "./EditorBlock.jsx";
import EditorPreview from "./EditorPreview.jsx";
import { cloneDeep } from "lodash";
import { useLeftMenuDragger } from "./useLeftMenuDragger.js";
import { useBlockSeleted } from "./useBlockSeleted.js";
import { useBlockDragger } from "./useBlockDragger.js";
import { useCommands } from "./useCommands.js";
import { ElIcon } from "element-plus";
import { $dialog } from "../components/Dialog.jsx";
import { $dropdown, DropDownItem } from "../components/Dropdown.jsx";
import { EditOperator } from "./EditOperator.jsx";
export default defineComponent({
  name: "Editor",
  props: {
    modelValue: {
      type: Object,
    },
    formData: {
      type: Object,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    console.log(props);

    const jsonData = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        const cloneValue = cloneDeep(newValue);
        ctx.emit("update:modelValue", cloneValue);
      },
    });

    const previewRef = ref(false);

    const editorCanvasStyle = computed(() => {
      return {
        width: jsonData.value.container.width + "px",
        height: jsonData.value.container.height + "px",
      };
    });

    const editorCanvasRef = ref(null);

    /* 1. 实现左侧菜单的拖拽功能 */
    const { handleDragStart, handleDragEnd } = useLeftMenuDragger(
      jsonData,
      editorCanvasRef
    );

    /* 2. 实现获取焦点 */
    /* 3. 实现批量拖拽 */
    const {
      handleBlockMouseDown,
      handleCanvasMouseDown,
      seleteData,
      lastSelectedBlock,
      clearBlockSeleted,
    } = useBlockSeleted(
      jsonData,
      (e) => {
        mouseDownCallback(e);
      },
      previewRef
    );

    /* 4. 实现画布选中调整位置以及辅助线的功能 */
    const { mouseDownCallback, markLine } = useBlockDragger(
      seleteData,
      lastSelectedBlock,
      jsonData
    );

    /* 5. 
      生成顶部的菜单选项
      resolveComponent基于组件注册的name获取组件实例对象
      h函数也就是createElement函数接受一个组件实例对象，返回一个虚拟dom对象
      虚拟dom对象经过render函数就会变成真实dom
    */
    const commandsMap = useCommands(jsonData, seleteData);

    let menuButtonList = [
      {
        label: "撤销",
        icon: "Back",
        handler: () => {
          commandsMap.undo();
        },
      },
      {
        label: "重做",
        icon: "RefreshLeft",
        handler: () => {
          commandsMap.redo();
        },
      },
      {
        label: "导入",
        icon: "Download",
        handler: () => {
          console.log("导入");
          $dialog({
            title: "导入JSON",
            content: "",
            showFooter: true,
            onConfirm: (text) => {
              console.log("新的json对象", JSON.parse(text));
              commandsMap.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      {
        label: "导出",
        icon: "Upload",
        handler: () => {
          console.log("导出");
          $dialog({
            title: "导出JSON使用",
            content: JSON.stringify(jsonData.value),
            showFooter: false,
          });
        },
      },
      {
        label: "置顶",
        icon: "SortUp",
        handler: () => {
          console.log("置顶");
          commandsMap.placeTop();
        },
      },
      {
        label: "置底",
        icon: "SortDown",
        handler: () => {
          console.log("置底");
          commandsMap.placeBottom();
        },
      },
      {
        label: "删除",
        icon: "Delete",
        handler: () => {
          console.log("删除");
          commandsMap.delete();
        },
      },
      {
        label: () => (previewRef.value ? "编辑" : "预览"),
        icon: () => (previewRef.value ? "Edit" : "View"),
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockSeleted();
        },
      },
      {
        label: () => (editRef.value ? "关闭编辑" : "打开编辑"),
        icon: () => (editRef.value ? "Close" : "Open"),
        handler: () => {
          editRef.value = !editRef.value;
          if (!editRef.value) {
            menuButtonList = btnList.slice(-1);
          } else {
            menuButtonList = btnList.slice();
          }
          clearBlockSeleted();
        },
      },
    ];
    // 默认就是编辑状态 展示全部面板
    const editRef = ref(true);
    const btnList = cloneDeep(menuButtonList);

    /* 
      6. 实现右键菜单功能
     */
    const handleContextMenu = (e, block) => {
      // 阻止默认事件
      e.preventDefault();

      // 需要弹出一个用户自定义的下拉框
      $dropdown({
        el: e.target,
        content: (
          <>
            <DropDownItem
              label="删除"
              icon="Delete"
              onClick={(e) => {
                commandsMap.delete();
              }}
            ></DropDownItem>
            <DropDownItem
              label="置顶"
              icon="SortUp"
              onClick={(e) => {
                commandsMap.placeTop();
              }}
            ></DropDownItem>
            <DropDownItem
              label="置底"
              icon="SortDown"
              onClick={(e) => {
                commandsMap.placeBottom();
              }}
            ></DropDownItem>

            <DropDownItem
              label="查看"
              icon="View"
              onClick={(e) => {
                $dialog({
                  title: "查看节点数据",
                  content: JSON.stringify(block),
                });
              }}
            ></DropDownItem>

            <DropDownItem
              label="导入"
              icon="Download"
              onClick={(e) => {
                $dialog({
                  title: "导入节点数据",
                  content: "",
                  showFooter: true,
                  onConfirm: (text) => {
                    commandsMap.updateBlock(ref(JSON.parse(text)).value, block);
                  },
                });
              }}
            ></DropDownItem>
          </>
        ),
      });
    };

    return () => (
      <>
        <h2>{JSON.stringify(props.formData)}</h2>

        <div class="editor">
          {/* 左侧组件物料区 */}
          {editRef.value ? (
            <div class="editor-left">
              {jsonData.value.previews.map((configData) => {
                return (
                  <EditorPreview
                    previewData={configData}
                    onDragstart={(e) => handleDragStart(e, configData)}
                    onDragend={(e) => handleDragEnd(e)}
                    key={configData.key}
                  ></EditorPreview>
                );
              })}
            </div>
          ) : null}

          <div class="editor-container">
            {/* 顶部菜单区 */}
            <div class="editor-container-top">
              {menuButtonList.map((btn) => {
                const icon =
                  typeof btn.icon === "function" ? btn.icon() : btn.icon;
                const label =
                  typeof btn.label === "function" ? btn.label() : btn.label;
                return (
                  <div class="menu-button" onClick={(e) => btn.handler(e)}>
                    <ElIcon size={20}>
                      {icon && h(resolveComponent(icon))}
                      {/* {btn.icon && h(btn.icon)} */}
                    </ElIcon>

                    <span>{label}</span>
                  </div>
                );
              })}
            </div>

            {/* 核心画布区 */}
            <div
              class="editor-container-canvas"
              style={editorCanvasStyle.value}
              ref={editorCanvasRef}
              onMousedown={(e) => handleCanvasMouseDown(e)}
            >
              <el-scrollbar height="100%">
                {jsonData.value.blocks.map((blockData, index) => {
                  return (
                    <div>
                      <EditorBlock
                        key={blockData.id}
                        formData={props.formData}
                        blockData={blockData}
                        onMousedown={(e) =>
                          handleBlockMouseDown(e, blockData, index)
                        }
                        onContextmenu={(e) => handleContextMenu(e, blockData)}
                        class={[
                          blockData.seleted ? "editor-block__seleted" : "",
                          previewRef.value ? "editor-block__preview" : "",
                          editRef.value ? "" : "editor-block__preview",
                        ]}
                      ></EditorBlock>
                      {/* 垂直方向的水平线 应该基于left确定偏移量 */}
                      {markLine.x && (
                        <div
                          class="line-x"
                          style={{ left: markLine.x + "px" }}
                        ></div>
                      )}

                      {/* 水平方向的水平线 应该基于top确定偏移量 */}
                      {markLine.y && (
                        <div
                          class="line-y"
                          style={{ top: markLine.y + "px" }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </el-scrollbar>
            </div>
          </div>

          {/* 右侧属性编辑区 */}
          {editRef.value ? (
            <div class="editor-right">
              <EditOperator
                data={jsonData.value}
                block={lastSelectedBlock.value}
                updateContainer={commandsMap.updateContainer}
                updateBlock={commandsMap.updateBlock}
              ></EditOperator>
            </div>
          ) : null}
        </div>
      </>
    );
  },
});
