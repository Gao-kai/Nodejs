function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);

  /**
   * 返回的函数是传入到createStore方法中的参数
   * 1. 在createStore的时候会默认dispatch触发执行一次 用于生成全局state对象
   * 2. 之后每一次dispacth都会执行此函数
   */
  return function combination(state, action) {
    if (state === void 0) {
      state = {};
    }

    let nextState = {};
    reducerKeys.forEach((key) => {
      const reducer = reducers[key];
      nextState[key] = reducer(state[key], action);
    });

    return nextState;
  };
}

export default combineReducers;
