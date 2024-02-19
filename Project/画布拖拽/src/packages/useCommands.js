import { cloneDeep } from "lodash";
import { eventBus } from "./event";
import { onUnmounted } from "vue";
import { counter } from "./useLeftMenuDragger";
export function useCommands(jsonData, seleteData) {
  const commandsState = {
    current: -1, // 前进后退的索引指针
    commandsMap: {}, // 命令的name和执行的功能映射表
    commandsArray: [], // 存放所有的命令
    quene: [], // 存放所有操作的队列
    destoryArray: [],
  };

  const registry = (command) => {
    commandsState.commandsArray.push(command);
    commandsState.commandsMap[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args);
      redo();

      if (!command.pushQuene) return;

      const { current } = commandsState;
      // 实现假设放置过程中用户点击了撤销 所以每次放置完成之后都需要重写截取队列current
      if (commandsState.quene.length) {
        commandsState.quene = commandsState.quene.slice(0, current + 1);
      }

      // 加入队列
      commandsState.quene.push({ redo, undo });
      // 更新指针
      commandsState.current = current + 1;
      console.log(commandsState.quene);
    };
  };

  /* 
    注册重做指令
  */
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          console.log("重做");
          let item = commandsState.quene[commandsState.current + 1];
          if (item) {
            item.redo && item.redo();
            commandsState.current++;
          }
        },
        // 这边可能会有其他功能 都可以通过这一层暴露出去
      };
    },
  });

  /* 
    注册撤销指令
  */
  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          console.log("撤销");
          if (commandsState.current == -1) return;
          let item = commandsState.quene[commandsState.current];
          if (item) {
            item.undo && item.undo();
            commandsState.current--;
          }
        },
      };
    },
  });

  /* 
    注册拖拽指令
    1.registry函数执行 会将当前这个command对象压入commandsArray数组，并且在commandsMap上
      添加一个名为drag的方法
    2.立即执行函数initCall执行，会取出init方法执行 执行的结果就是开启拖拽开始和结束的全局事件监听
    3.用户开始拖拽，emit一个 $startDrag 事件，此时拿到beforeState的数据，并挂载到command对象上
    4.用户放置到画布上，此时blocks数组中就会多一项数据
    5.用户结束拖拽，emit一个$endDrag事件，此时触发第一步注册的commandsMap.drag方法
    6.开始执行commandsMap.drag方法，首先执行command.execute()
    7.在command.execute()方法内部，首先取出command上的beforeState，然后取到当前也就是操作之后
      的blocks数据，返回一个redo重做和undo撤销方法
    8.由于commadn上有pushQuene，所以需要将返回的{undo，redo}对象压入队列中，并修改current指针+1
      因为每一个undo，redo方法在执行的时候都由于闭包的关系保存着当前这一次拖拽前后的blocks数据
    至此前面8个步骤都没有设计撤销或者重做按钮的点击，所以只是通过闭包将每一个操作前后的blocks保存

    当点击撤销按钮的时候，触发commandsMap.undo方法，进一步执行execute方法返回的redo方法
    在这个方法内部，从全局变量commandsState.quene上基于current指针取出队列中的对象
    从对象上取出undo方法，此方法执行的结果就是将blocks的状态赋值给before的状态
    同时必须要修改current--
    撤销的时候只需要获取current即可，因为当前current对象上存放的before就是前一步的状态

    同理，当点击重做的时候，只需要把current+1然后取出对象，执行对象上的redo方法
    执行的结果就是将blocks状态赋值为after状态
    同时必须要让current++
    这里为什么要current+1呢？因为重做的意思是恢复后一步的状态，后一步最新的状态保存在其自身的after上
    

    注意，外界操作撤销和重做按钮的时候都没有修改队列，只是基于指针获取队列上某一步的状态

    只有手动拖拽的时候才需要取修改队列，并且必须注意到当点击撤销之后再去拖拽的时候，就必须要基于当前current
    的值将后面的quene给清空，否则会发生新的元素还是叠加在已经撤销的item之后的bug
  */
  registry({
    name: "drag",
    pushQuene: true, // 是否需要加入队列管理
    // 初始化操作 注册命令时就需要执行的操作
    init() {
      this.beforeState = null;

      // 开始拖拽先保存初始状态
      const $startDrag = () => {
        this.beforeState = cloneDeep(jsonData.value.blocks);
      };

      // 拖拽结束就需要执行注册的命令 会导致execute执行 进一步执行redo
      const $endDrag = () => {
        console.log(jsonData.value.blocks);
        commandsState.commandsMap.drag();
      };

      /* 开启监听 */
      eventBus.on("$startDrag", $startDrag);
      eventBus.on("$endDrag", $endDrag);

      /* 返回一个取消订阅的函数 */
      return () => {
        eventBus.off("$startDrag", $startDrag);
        eventBus.off("$endDrag", $endDrag);
      };
    },
    execute() {
      // before保存的是拖拽前的数据
      let before = this.beforeState;
      // 因为在drop的时候已经给jsonData中存放了数据 所以这里可以最新的blocks数据
      // after保存的是当前最新的数据
      let after = jsonData.value.blocks;
      return {
        /* 执行redo方法 就是将当前最新的状态赋值*/
        redo() {
          jsonData.value = {
            ...jsonData.value,
            blocks: after,
          };
        },
        /* 撤销 用拖拽之前的状态 */
        undo() {
          jsonData.value = {
            ...jsonData.value,
            blocks: before,
          };
        },
      };
    },
  });

  /* 
    注册导入新的json后更新画布的命令
  */
  registry({
    name: "updateContainer",
    pushQuene: true,
    execute(newJsonData) {
      let before = jsonData.value;
      let after = newJsonData;
      return {
        redo() {
          jsonData.value = after;
        },
        undo() {
          jsonData.value = before;
        },
      };
    },
  });

  /* 
    注册导入单个节点json后更新画布的命令
  */
  registry({
    name: "updateBlock",
    pushQuene: true,
    execute(newBlockData, oldBlockData) {
      let state = {
        before: jsonData.value.blocks,
        after: (() => {
          let blocks = [...jsonData.value.blocks];
          const index = blocks.indexOf(oldBlockData);
          if (index !== -1) {
            blocks.splice(index, 1, newBlockData);
          }
          return blocks;
        })(),
      };

      return {
        redo() {
          jsonData.value = { ...jsonData.value, blocks: state.after };
        },
        undo() {
          jsonData.value = { ...jsonData.value, blocks: state.before };
        },
      };
    },
  });

  /* 
    注册置顶指令
  */
  registry({
    name: "placeTop",
    pushQuene: true,
    execute() {
      let before = cloneDeep(jsonData.value.blocks);
      let after = (function () {
        // 置顶就是找到所有未选中元素的最大Index值

        const maxIndex = seleteData.value.unSeleted.reduce((prev, curr) => {
          return Math.max(prev, curr.zIndex);
        }, Number.MIN_SAFE_INTEGER);

        // 然后让所有选中的index值为最大Index值+1即可
        seleteData.value.seleted.forEach((block) => {
          block.zIndex = maxIndex + 1;
        });

        return jsonData.value.blocks;
      })();
      return {
        redo() {
          jsonData.value = { ...jsonData.value, blocks: after };
        },
        undo() {
          jsonData.value = { ...jsonData.value, blocks: before };
        },
      };
    },
  });

  /* 
    注册置底指令
  */
  registry({
    name: "placeBottom",
    pushQuene: true,
    execute() {
      let before = cloneDeep(jsonData.value.blocks);
      let after = (function () {
        // 置底就是找到所有未选中元素的最小Index值
        let minIndex = seleteData.value.unSeleted.reduce((prev, curr) => {
          return Math.min(prev, curr.zIndex);
        }, Number.MAX_SAFE_INTEGER);

        // 只要当前所选的每一个的index都小于最小index值 就实现了置底
        if (minIndex > 1) {
          seleteData.value.seleted.forEach((block) => {
            block.zIndex = minIndex - 1;
          });
        } else {
          // 当minIndex小于等于1的时候 不再让当前选中的index减少为0或负数
          // 而是让当前所有已经选中的变为1 然后给所有未选中的+1
          minIndex = 0;
          // 所有未选中的加上1
          seleteData.value.unSeleted.forEach((block) => {
            block.zIndex += 1;
          });
          // 所有已经选中的设置为最小值
          seleteData.value.seleted.forEach((block) => {
            block.zIndex = minIndex;
          });
        }

        return jsonData.value.blocks;
      })();
      return {
        redo() {
          jsonData.value = { ...jsonData.value, blocks: after };
        },
        undo() {
          jsonData.value = { ...jsonData.value, blocks: before };
        },
      };
    },
  });

  /* 
    注册删除指令
  */
  registry({
    name: "delete",
    pushQuene: true,
    execute() {
      let before = cloneDeep(jsonData.value.blocks);
      let after = seleteData.value.unSeleted;

      return {
        redo() {
          jsonData.value = { ...jsonData.value, blocks: after };
        },
        undo() {
          jsonData.value = { ...jsonData.value, blocks: before };
        },
      };
    },
  });

  /* 
    添加键盘事件
    crtl + z 撤销
    ctrl + y 重做
  */
  function addKeyBoardEvents() {
    const keyCodeMap = {
      90: "z",
      89: "y",
    };

    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e;
      let keyList = [];
      if (ctrlKey) {
        keyList.push("ctrl");
      }
      keyList.push(keyCodeMap[keyCode]);
      let keyString = keyList.join("+");
      console.log(keyString);
      commandsState.commandsArray.forEach((command) => {
        const { keyboard, name } = command;
        if (!keyboard) return;
        // 基于keyString匹配取出对应的command上的方法
        if (keyboard === keyString) {
          /* 
               commandsState.commandsMap上存放着key-fn的映射
               drag：fn
               redo：fn
               undo：fn
               执行fn的过程就是执行注册时的excute返回的redo函数以后面的drag逻辑的过程
            */
          const fn = commandsState.commandsMap[name];
          fn();
          e.preventDefault();
        }
      });
    };

    window.addEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }

  /* 
    初始化逻辑：
    1. 执行每一个command中自身的init方法 并将注销函数放入数组destoryArray
    2. 绑定键盘事件 同样将键盘事件的取消函数放入数组destoryArray
  */
  function initCall() {
    commandsState.commandsArray.forEach((command) => {
      if (command.init) {
        // init函数执行会返回一个取消函数 需要收集起来
        commandsState.destoryArray.push(command.init());
      }
    });

    const cancleKeyBoardEvent = addKeyBoardEvents();
    commandsState.destoryArray.push(cancleKeyBoardEvent);
  }
  initCall();

  onUnmounted(() => {
    commandsState.destoryArray.forEach((cancleFn) => {
      if (typeof cancleFn === "function") cancleFn();
    });
  });

  return commandsState.commandsMap;
}
