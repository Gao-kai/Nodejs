import { reactive } from "vue";
import { eventBus } from "./event";

export function useBlockDragger(seleteData, lastSelectedBlock, jsonData) {
  /* 
    在画布中鼠标移动要想引起元素拖动效果，比如实现两个步骤：
    1. 获取元素的初始尺寸信息以及位置信息，比如一个盒子现在宽高是200*100，top和left的值都是800
    2. 其次需要获取到当前鼠标点击的位置，也就是clientX和clientY
    3. 在mousemove的时候，就需要获取到最新的鼠标位置然后计算出最新的盒子的top和left的值赋值给block
    4. 然后通过计算属性更新style 然后更新元素位置
  */

  let draggerState = {
    startX: 0, // 起始鼠标点击的x坐标
    startY: 0, // 起始鼠标点击的y坐标
    startTop: 0, //起始的元素距离画布顶部的top值
    startLeft: 0, // 起始的元素距离画布顶部的left值
    isDragging: false,
  };

  /* 记录当前所有选中的每一个block的元素位置 里面组成是{left:xx,top:yy} */
  let currSelectedBlocksPosList = [];

  /* 
    收集辅助线的数组
    horizontalLines数组中存放的是所有
  */
  let helperLines = {
    yAxis: [],
    xAxis: [],
  };

  /* 辅助线的响应式对象  */
  let markLine = reactive({
    x: null, // 在x坐标轴上的位置，决定了垂直辅助线的left定位属性
    y: null, // 在y坐标轴上的位置，决定了水平辅助线的top定位属性
  });

  // 回调执行表示已经计算好当前所选中的元素了
  function mouseDownCallback(e) {
    console.log("鼠标按下 绑定事件 移动开始", e);

    /* 
      读取到当前最后一个选中的元素的宽高等属性
      基于最后选中的元素创建当前画布上其他各元素的辅助线
    */
    const {
      width: selectedWidth,
      height: selectedheight,
      left: selectedLeft,
      top: selectedTop,
    } = lastSelectedBlock.value;

    // 所有未选中的元素都是参照物 基于参照物创建辅助线
    const unSelectedBlocks = seleteData.value.unSeleted;
    // 画布自身也是一个参照物
    const canvasBlockData = {
      left: 0,
      top: 0,
      width: jsonData.value.container.width,
      height: jsonData.value.container.height,
    };

    // 计算何时出现辅助线以及辅助线出现的位置
    unSelectedBlocks.concat(canvasBlockData).forEach((block) => {
      const {
        top: unSelectedTop,
        left: unSelectedLeft,
        width: unSelectedWidth,
        height: unSelectedHeight,
      } = block;
      /* 
        每一个未选中的block都应该和当前最后一个选中的元素存在10条辅助线
        水平5条，垂直5条，总共10条

        第一步是先计算当选中的lastSelectedBlock移动到什么left和top的时候显示辅助线？showTop表示辅助线应该呈现在什么位置
        第二步是计算到时候显示的辅助线在画布上的位置？moveTop表示当移动到距离top多少px的时候展示辅助线
       */

      // 水平顶对顶
      helperLines.yAxis.push({
        showTop: unSelectedTop,
        moveTop: unSelectedTop,
      });
      // 水平顶对底
      helperLines.yAxis.push({
        showTop: unSelectedTop,
        moveTop: unSelectedTop - selectedheight,
      });
      // 水平居中
      helperLines.yAxis.push({
        showTop: unSelectedTop + unSelectedHeight / 2,
        moveTop: unSelectedTop + unSelectedHeight / 2 - selectedheight / 2,
      });
      // 水平底对顶
      helperLines.yAxis.push({
        showTop: unSelectedTop + unSelectedHeight,
        moveTop: unSelectedTop + unSelectedHeight,
      });
      // 水平底对底
      helperLines.yAxis.push({
        showTop: unSelectedTop + unSelectedHeight,
        moveTop: unSelectedTop + unSelectedHeight - selectedheight,
      });

      // 垂直左对左
      helperLines.xAxis.push({
        showLeft: unSelectedLeft,
        moveLeft: unSelectedLeft,
      });

      // 垂直右对右
      helperLines.xAxis.push({
        showLeft: unSelectedLeft + unSelectedWidth,
        moveLeft: unSelectedLeft + unSelectedWidth - selectedWidth,
      });

      // 垂直居中
      helperLines.xAxis.push({
        showLeft: unSelectedLeft + unSelectedWidth / 2,
        moveLeft: unSelectedLeft + unSelectedWidth / 2 - selectedWidth / 2,
      });

      // 垂直左对右
      helperLines.xAxis.push({
        showLeft: unSelectedLeft,
        moveLeft: unSelectedLeft - selectedWidth,
      });

      // 垂直右对左
      helperLines.xAxis.push({
        showLeft: unSelectedLeft + unSelectedWidth,
        moveLeft: unSelectedLeft + unSelectedWidth,
      });
    });

    // 更新位置信息
    draggerState = {
      startX: e.clientX, // 起始鼠标点击的x坐标
      startY: e.clientY, // 起始鼠标点击的y坐标
      startTop: selectedTop, //起始的元素距离画布顶部的top值
      startLeft: selectedLeft, // 起始的元素距离画布顶部的left值
      isDragging: false,
    };

    // 记录每一个选中项的起始点的left值和top值 按照顺序依次放入数组
    currSelectedBlocksPosList = seleteData.value.seleted.map(
      ({ left, top }) => ({
        left,
        top,
      })
    );

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }
  const handleMouseUp = (e) => {
    console.log("鼠标弹起 移动结束", e);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    markLine.x = null;
    markLine.y = null;
    // 如果只是点击抬起 那么不派发事件
    // 只有拖动了鼠标也就是draggerState.isDragging为true的情况下才派发事件
    if (draggerState.isDragging) {
      eventBus.emit("$endDrag");
    }
  };
  const handleMouseMove = (e) => {
    console.log("鼠标移动", e);

    if (!draggerState.isDragging) {
      // 前面鼠标按下可能是选中 并不是在画布上拖动元素
      // 但是这里已经到了move的事件函数 说明肯定是拖拽
      // 此时就要派发事件告诉bus 画布内的拖拽开始了
      draggerState.isDragging = true;
      eventBus.emit("$startDrag");
    }

    /* 1. 获取鼠标当前的最新位置 */
    let currClientX = e.clientX;
    let currClientY = e.clientY;

    /* 
      4. 接下来处理辅助线 首先获取最后一个选中的元素的当前的left和top值
        currClientX:当前鼠标的x坐标
        draggerState.startX：鼠标开始移动时的初始化x坐标
        draggerState.startLeft：最后袷所选元素最开始距离左边界的距离也就是left值
        currClientX - draggerState.startX获取到鼠标在x方向上的位移量，然后加上最初的left值就是元素最新的left值
        最新的top值计算原理同上
    */
    let currSelectedLeft =
      currClientX - draggerState.startX + draggerState.startLeft;
    let currSelectedTop =
      currClientY - draggerState.startY + draggerState.startTop;

    /* 
      5. 在位移过程中计算可能出现辅助线的位置
      原理就是当当前元素currSelectedTop值距离前面计算出来的辅助线数组中的任意一个top值的绝对差值小于5px的时候
      就认为此时可以出现辅助线，用一个变量记录辅助线相对于画布的left偏移或者top偏移量
    */
    let y = null; // 在y坐标轴上的值
    for (let i = 0; i < helperLines.yAxis.length; i++) {
      const line = helperLines.yAxis[i];
      // showTop是辅助线应该出现的top值
      // moveTop是预计出现辅助线的元素的top值
      const { showTop, moveTop } = line;
      if (Math.abs(moveTop - currSelectedTop) <= 5) {
        y = showTop;
        // 实现快速贴边：按道理 最新的鼠标的y坐标点位置应该是 起始坐标距离顶部距离startY - 起始元素距离顶部top 也就是鼠标点距离元素内部的距离
        // 然后这个距离原本来说应该加上当前最新的currSelectedTop就一定合理
        // 但是这里为了吸附 将这个值修改为加上moveTop 也就是预计会出现辅助线的top位置
        // 本质还是将原本鼠标事件给出的clientY进行修改得到currClientY 然后在给元素的top赋值的时候会将这部分计算进去
        currClientY = draggerState.startY - draggerState.startTop + moveTop;
        // 找到就立即退出循环
        break;
      }
    }

    let x = null; // 在x坐标轴上的值
    for (let i = 0; i < helperLines.xAxis.length; i++) {
      const line = helperLines.xAxis[i];
      // showLeft是辅助线应该出现的left值
      // moveLeft是预计出现辅助线的元素的left值
      const { showLeft, moveLeft } = line;
      if (Math.abs(moveLeft - currSelectedLeft) <= 5) {
        x = showLeft;
        // 实现快速贴边
        currClientX = draggerState.startX - draggerState.startLeft + moveLeft;
        // 找到就立即退出
        break;
      }
    }

    /* 2. 计算鼠标在x和y轴上的位移 */
    let durX = currClientX - draggerState.startX;
    let durY = currClientY - draggerState.startY;

    /* 
          3. 更新所有所选block的left和top值
          每一个所选block的新的left和top的计算方法就是：当前鼠标位置 - 起点鼠标位置 + left/top值即可 
         */
    seleteData.value.seleted.forEach((block, index) => {
      block.top = currSelectedBlocksPosList[index].top + durY;
      block.left = currSelectedBlocksPosList[index].left + durX;
    });

    /* 
      6. 响应式数据赋值 更新视图
    */
    markLine.x = x;
    markLine.y = y;
  };

  return {
    mouseDownCallback,
    markLine,
  };
}
