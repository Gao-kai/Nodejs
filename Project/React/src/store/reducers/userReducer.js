import { cloneDeep } from "lodash";

let userState = {
  info: {},
  token: "",
};

const userReducer = function (state = userState, action) {
  const { type } = action;
  const cloneState = cloneDeep(state);

  switch (type) {
    case "SAVE_TOKEN":
      userState.token = action.token;
      break;
    case "SAVE_INFO":
      userState.info = action.payload;
      break;
    default:
  }

  return cloneState;
};

export default userReducer;
