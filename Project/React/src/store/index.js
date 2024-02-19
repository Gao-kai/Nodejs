import { createStore, applyMiddleware } from "redux";
// import * as redux from "@/redux/redux.js";

import reducer from "./reducers/index";

/* middleWares */
import reduxLogger from "redux-logger";
import { thunk } from "redux-thunk";
import reduxPromise from "redux-promise";

const store = createStore(
  reducer,
  applyMiddleware(reduxLogger, thunk, reduxPromise)
);
export default store;
