import { cloneDeep } from "lodash";
import * as Types from "../action-types";

let todoState = {
  activeType: "All",
  dataSource: [],
};

const todoReducer = function (state = todoState, action) {
  const { type } = action;
  const cloneState = cloneDeep(state);

  switch (type) {
    case Types.ADD_TASK:
      cloneState.dataSource = action.payload;
      break;
    case Types.REMOVE_TASK:
      cloneState.dataSource = action.payload;
      break;
    case Types.COMPLETE_TASK:
      cloneState.dataSource = action.payload;
      break;
    case Types.CHANGE_TYPE:
      cloneState.activeType = action.payload.type;
      cloneState.dataSource = action.payload.list;
      break;
    case Types.QUERY_LIST:
      cloneState.dataSource = action.payload;
      break;
    default:
  }

  return cloneState;
};

export default todoReducer;
