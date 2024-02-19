import { cloneDeep } from "lodash";

let voteState = {
  support: 0,
  objection: 0,
  total: 0,
};

const voteReducer = function (state = voteState, action) {
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

export default voteReducer;
