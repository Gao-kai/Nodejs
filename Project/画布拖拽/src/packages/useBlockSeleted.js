import { computed, ref } from "vue";
export function useBlockSeleted(jsonData, callback, previewRef) {
  const lastSelectedIndex = ref(-1);
  const lastSelectedBlock = computed(() => {
    return jsonData.value.blocks[lastSelectedIndex.value];
  });

  const seleteData = computed(() => {
    let seleted = jsonData.value.blocks.filter((block) => block.seleted);
    let unSeleted = jsonData.value.blocks.filter((block) => !block.seleted);
    return {
      seleted,
      unSeleted,
    };
  });

  const handleBlockMouseDown = (e, block, index) => {
    if (previewRef.value) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey) {
      // 按住ctrl选择的时候 如果只有一个了 就不取消状态了
      if (seleteData.value.length <= 1) {
        block.seleted = true;
      } else {
        // 如果大于一个 可以切换状态 避免回调执行 也就是后续调整画图中组件时把原本选中的取消了
        block.seleted = !block.seleted;
      }
    } else {
      // 如果没选中 那就让这一项选中
      if (!block.seleted) {
        // 选中当前项 重置其他项的选中状态为未选中
        clearBlockSeleted();
        block.seleted = true;
      } else {
        // 如果选中了 那也不取消 取消只能点击画布其他地方取消
      }
    }

    // 更新最后选中的block索引
    lastSelectedIndex.value = index;

    // 每次内部选中完成之后马上将当前选中项和非选中项的信息通过回调函数提供出去
    // 因为选中之后可能直接拖拽了
    callback(e);
  };

  const clearBlockSeleted = () => {
    jsonData.value.blocks.forEach((block) => {
      block.seleted = false;
    });
  };

  const handleCanvasMouseDown = () => {
    if (previewRef.value) return;
    clearBlockSeleted();
    lastSelectedIndex.value = -1;
  };

  return {
    handleBlockMouseDown,
    handleCanvasMouseDown,
    seleteData,
    lastSelectedBlock,
    clearBlockSeleted,
  };
}
