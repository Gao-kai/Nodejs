import * as redux from "redux";
// import * as redux from "./redux";
import { cloneDeep } from "lodash";

let initialState = {
  support: 0,
  objection: 0,
};

const reducer = function (state = initialState, action) {
  const { type } = action;
  const cloneState = cloneDeep(state);

  switch (type) {
    case "SUPPORT":
      cloneState.support += 1;
      break;
    case "OBJECTION":
      cloneState.objection += 1;
      break;
    default:
  }

  return cloneState;
};

const store = redux.createStore(reducer);

export default store;
