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
export function addList(body) {
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

export function removeList(id) {
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

export function complteList(id) {
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

export function queryList(type = "All") {
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
