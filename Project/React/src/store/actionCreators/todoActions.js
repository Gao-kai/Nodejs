import * as Types from "../action-types";

function getLocalData(key = "taskList") {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  } else {
    return [];
  }
}

function setLocalData(data, key = "taskList") {
  localStorage.setItem(key, JSON.stringify(data));
}

/* apis */
function addList(body) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const localTaskList = getLocalData();
      localTaskList.push(body);
      setLocalData(localTaskList);
      resolve({
        code: 200,
        message: "add success",
      });
    }, 500);
  });
}

function removeList(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const localTaskList = getLocalData();
      const index = localTaskList.findIndex((item) => item.key === id);
      if (index !== -1) {
        localTaskList.splice(index, 1);
      }
      setLocalData(localTaskList);
      resolve({
        code: 200,
        message: "remove success",
      });
    }, 500);
  });
}

function complteList(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const localTaskList = getLocalData();
      const index = localTaskList.findIndex((item) => item.key === id);
      if (index !== -1) {
        localTaskList[index].status = 1;
      }
      setLocalData(localTaskList);
      resolve({
        code: 200,
        message: "complate success",
      });
    }, 500);
  });
}

function queryList(type = "All") {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const localTaskList = getLocalData();
      switch (type) {
        case "All":
          resolve({
            code: 200,
            message: "query success",
            data: localTaskList,
          });
          break;
        case "Unfinished":
          resolve({
            code: 200,
            message: "query success",
            data: localTaskList.filter((item) => item.status === 0),
          });
          break;
        case "Done":
          resolve({
            code: 200,
            message: "query success",
            data: localTaskList.filter((item) => item.status === 1),
          });
          break;

        default:
          break;
      }
    }, 500);
  });
}

/**
 * actionCreators
 */
const todoActions = {
  async getTaskList(type = "All") {
    const res = await queryList(type);
    return {
      type: Types.QUERY_LIST,
      payload: res.data,
    };
  },
  async addTask(body) {
    await addList(body);
    const res = await queryList();
    return {
      type: Types.ADD_TASK,
      payload: res.data,
    };
  },
  async removeTask(id) {
    await removeList(id);
    const res = await queryList();
    return {
      type: Types.REMOVE_TASK,
      payload: res.data,
    };
  },
  async complteTask(id) {
    await complteList(id);
    const res = await queryList();
    return {
      type: Types.COMPLETE_TASK,
      payload: res.data,
    };
  },
  async changeType(type) {
    const res = await queryList(type);
    return {
      type: Types.CHANGE_TYPE,
      payload: {
        list: res.data,
        type,
      },
    };
  },
};

export default todoActions;
