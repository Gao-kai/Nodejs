import * as Types from "../action-types";

const getList = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([1, 2, 3]);
    }, 1000);
  });
};

const voteActions = {
  /* 
    使用redux-thunk处理异步
    1. 返回一个函数而不是一个promise实例
    2. 在异步逻辑中需要开发者手动dispatch派发
   */
  addSupport() {
    return async (dispatch) => {
      try {
        const list = await getList();
        dispatch({
          type: Types.SUPPORT,
          payload: list,
        });
      } catch (error) {
        console.log(error);
      }
    };
  },
  /* 
    使用redux-promise处理异步
    1. 按照正常逻辑 将actionCreator用async修饰
    2. 然后再内部await异步结果
    3. 返回包含type和数据的对象
  */

  async addObjection() {
    try {
      const list = await getList();
      return {
        type: Types.OBJECTION,
        payload: list,
      };
    } catch (error) {}
  },
};

export default voteActions;
