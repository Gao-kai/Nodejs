function createThunkMiddleware() {
  return function middleware(store) {
    const { dispatch, getState } = store;
    const next = dispatch;
    const dispatchAndThunk = (action) => {
      if (typeof action === "function") {
        action(dispatch, getState);
      } else {
        return next(action);
      }
    };
    /* 
        首次执行会将全局的 store.dispatch 重写了 经典的函数劫持
        1. 后续用户执行store.dispatch 就可以注入自己的逻辑 如果action是函数就先将
        action执行，并把原生的dispatch和getstate传递过去
        2. 如果action是对象，那么就走原来未劫持前的store.dispatch 
    */
    store.dispatch = dispatchAndThunk;
  };
}

const thunkMiddleware = createThunkMiddleware();
export default thunkMiddleware;
