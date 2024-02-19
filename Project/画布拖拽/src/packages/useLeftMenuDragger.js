import { onMounted, onBeforeUnmount } from "vue";
import { eventBus } from "./event";
export let counter = 1;
export function useLeftMenuDragger(jsonData, editorCanvasRef) {
  let currActiveComponent = null;

  const handleDragStart = (e, component) => {
    console.log("开始拖拽", { e, component });
    currActiveComponent = component;
    // 开始拖动 派发全局事件
    eventBus.emit("$startDrag");
  };

  const handleDragEnd = (e) => {
    console.log("拖拽结束", { e });
    currActiveComponent = null;
    // 拖动结束 派发全局事件
    eventBus.emit("$endDrag");
  };

  /* 元素进入当前区域 添加一个可移动的标识 */
  const handelDragEnter = (e) => {
    e.dataTransfer.dropEffect = "move";
  };

  /* 元素在当前区域移动 必须阻止默认行为 否则无法触发drop事件 */
  const handelDragOver = (e) => {
    e.preventDefault();
  };

  /* 元素离开添加一个no的标识 */
  const handelDragLeave = (e) => {
    e.dataTransfer.dropEffect = "none";
  };

  /* 松手的时候 基于当前拖拽的信息 添加一个组件 */
  const handelDrop = (e) => {
    console.log("放置元素", jsonData.value.blocks);
    counter++;
    // 触发setter 进一步触发父组件的数据更新 然后触发子组件的更新
    jsonData.value = {
      ...jsonData.value,
      blocks: [
        ...jsonData.value.blocks,
        {
          left: e.offsetX,
          top: e.offsetY,
          zIndex: 1,
          key: currActiveComponent.key,
          needCenter: true,
          id: currActiveComponent.key + counter,
          props: {},
          model: {},
        },
      ],
    };
  };

  onBeforeUnmount(() => {
    editorCanvasRef.value.removeEventListener("dragenter", handelDragEnter);
    editorCanvasRef.value.removeEventListener("dragover", handelDragOver);
    editorCanvasRef.value.removeEventListener("dragleave", handelDragLeave);
    editorCanvasRef.value.removeEventListener("drop", handelDrop);
  });

  onMounted(() => {
    editorCanvasRef?.value?.addEventListener("dragenter", handelDragEnter);
    editorCanvasRef?.value?.addEventListener("dragover", handelDragOver);
    editorCanvasRef?.value?.addEventListener("dragleave", handelDragLeave);
    editorCanvasRef?.value?.addEventListener("drop", handelDrop);
  });

  return {
    handleDragStart,
    handleDragEnd,
  };
}
