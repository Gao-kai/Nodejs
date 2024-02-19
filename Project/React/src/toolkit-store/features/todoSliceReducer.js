import { createSlice } from "@reduxjs/toolkit";

/* 导入api */
import * as todoApi from "@/apis/todo";

/**
 * 1. 可以直接设置初始状态
 * 2. 可以直接将原来分离的actionCreator也就是专门产生dispacth参数的函数
 *      和reducer进行合并
 * 3. 每一个reducer的参数只能接受payload
 * 4. 因为内部使用了immer库 所以可以直接对state进行修改 之前还需要深克隆 现在不需要了
 *
 */
const todoReducerSlice = createSlice({
  name: "todo",
  initialState: {
    activeType: "All",
    dataSource: [],
  },
  reducers: {
    getTaskList(state, { payload }) {
      state.dataSource = payload.list;
    },
    addTask(state, { payload }) {
      // await todoApi.addList(payload);
      // const res = await todoApi.queryList();
      // state.dataSource = res.data;
    },
    removeTask(state, { payload: id }) {
      // await todoApi.removeList(id);
      // const res = await todoApi.queryList();
      // state.dataSource = res.data;
    },
    complteTask(state, { payload: id }) {
      // await todoApi.complteList(id);
      // const res = await todoApi.queryList();
      // state.dataSource = res.data;
    },
    changeType(state, { payload: activeType }) {
      // state.dataSource = await todoApi.queryList(activeTYpe);
      state.activeType = activeType;
    },
  },
});

/**
 * 获取同步和异步actions
 * 注意这里导出的getTaskList和上面reducers可不是一个东西
 * 这里导出的getTaskList执行：
 * 1. 如果是同步逻辑 会返回一个type和action的对象
 * 2. 如果是thunk异步逻辑 会返回一个async函数
 * 3. 如果是promise-redux逻辑 会返回一个异步处理之后得到的type和action的对象
 *
 * 返回的对象中：type就是reducer的name和reducer函数名拼接的结果 比如"todo/getTaskList"
 *             action中包含的一定是payload对象
 */

export const { getTaskList, addTask, removeTask, complteTask, changeType } =
  todoReducerSlice.actions;

export const getTaskListAsyncAction = (type = "All") => {
  return async (dispatch) => {
    let list = [];
    try {
      const res = await todoApi.queryList(type);
      list = res.data;
    } catch (error) {
      console.log(error);
    }
    const action = getTaskList({
      list,
    });
    console.log(action);
    dispatch(action);
  };
};

export const addTaskAsyncAction = (body) => {
  return async (dispatch) => {
    try {
      const res = await todoApi.addList(body);
      dispatch(addTask(res.data));
    } catch (error) {
      console.log(error);
    }
  };
};

export const removeTaskAsyncAction = (id) => {
  return async (dispatch) => {
    try {
      const res = await todoApi.removeList(id);
      dispatch(removeTask(res.data));
    } catch (error) {
      console.log(error);
    }
  };
};

export const complteTaskAsyncAction = (id) => {
  return async (dispatch) => {
    try {
      const res = await todoApi.complteList(id);
      dispatch(complteTask(res.data));
    } catch (error) {
      console.log(error);
    }
  };
};

export default todoReducerSlice.reducer;
