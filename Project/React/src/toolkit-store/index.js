import { configureStore } from "@reduxjs/toolkit";

/* middleWares */

import reduxLogger from "redux-logger";
import reduxPromise from "redux-promise";

/* reducert slice */
import todoSliceReducers from "./features/todoSliceReducer";

const store = configureStore({
  reducer: {
    todo: todoSliceReducers,
  },
  /* 要么别指定中间件 默认会注入thunk 如果指定了就会用用户指定的替换默认的 */
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([reduxLogger, reduxPromise]),
});

export default store;
