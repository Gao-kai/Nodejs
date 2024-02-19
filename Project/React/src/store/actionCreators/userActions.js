import * as Types from "../action-types";

const userActions = {
  saveToken() {
    return {
      type: Types.SAVE_TOKEN,
      token: "xxx",
    };
  },
  saveInfo() {
    return {
      type: Types.SAVE_INFO,
      payload: {
        name: "lilei",
        age: 18,
      },
    };
  },
};

export default userActions;
