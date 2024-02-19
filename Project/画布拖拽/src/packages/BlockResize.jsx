import { defineComponent } from "vue";

export default defineComponent({
  props: {
    componentConfig: {
      type: Object,
    },
    blockData: {
      type: Object,
    },
  },
  setup(props) {
    const { width, height } = props.componentConfig.resize || {};
    let dragState = {
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startLeft: 0,
      startTop: 0,
      direction: {},
    };
    const handleMouseDown = (e, direction) => {
      // 防止拖动描点把元素也拖动了
      e.stopPropagation();

      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.blockData.width,
        startHeight: props.blockData.height,
        startLeft: props.blockData.left,
        startTop: props.blockData.top,
        direction,
      };

      document.body.addEventListener("mousemove", onMouseMove);
      document.body.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      let { clientX, clientY } = e;
      let {
        startX,
        startY,
        startWidth,
        startHeight,
        startLeft,
        startTop,
        direction,
      } = dragState;

      // 鼠标移动 计算起始位置 然后实时计算偏移量

      if (direction.horizontal === "center") {
        // 无论向什么方向拖动 只能改变元素的高度 宽度不可以改变
        clientX = startX;
      }

      if (direction.vertical === "center") {
        // 无论向什么方向拖动 只能改变元素的高度 宽度不可以改变
        clientY = startY;
      }

      let durX = clientX - startX;
      let durY = clientY - startY;

      if (direction.vertical === "start") {
        durY = -durY;
        props.blockData.top = startTop - durY;
      }

      if (direction.horizontal === "start") {
        durX = -durX;
        props.blockData.left = startLeft - durX;
      }

      props.blockData.width = startWidth + durX;
      props.blockData.height = startHeight + durY;
      props.blockData.hasResized = true;
      // 将新的left top width 以及height赋值给元素即可
    };
    const onMouseUp = () => {
      document.body.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseup", onMouseUp);
    };

    return () => {
      return (
        <div>
          {width && (
            <>
              <div
                class="block-resize block-resize-left"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "start", // 处于水平轴的起点
                    vertical: "center", // 处于垂直轴的中点
                  })
                }
              ></div>
              <div
                class="block-resize block-resize-right"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "end",
                    vertical: "center",
                  })
                }
              ></div>
            </>
          )}

          {height && (
            <>
              <div
                class="block-resize block-resize-top"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "center",
                    vertical: "start",
                  })
                }
              ></div>
              <div
                class="block-resize block-resize-bottom"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "center",
                    vertical: "end",
                  })
                }
              ></div>
            </>
          )}

          {width && height && (
            <>
              <div
                class="block-resize block-resize-top-left"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "start",
                    vertical: "start",
                  })
                }
              ></div>
              <div
                class="block-resize block-resize-top-right"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "end",
                    vertical: "start",
                  })
                }
              ></div>
              <div
                class="block-resize block-resize-bottom-left"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "start",
                    vertical: "end",
                  })
                }
              ></div>
              <div
                class="block-resize block-resize-bottom-right"
                onMousedown={(e) =>
                  handleMouseDown(e, {
                    horizontal: "end",
                    vertical: "end",
                  })
                }
              ></div>
            </>
          )}
        </div>
      );
    };
  },
});
