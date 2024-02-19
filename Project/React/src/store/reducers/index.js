import { combineReducers } from "redux";
// import combineReducers from "@/redux/combineReducers";
import userReducer from "./userReducer";
import voteReducer from "./voteReducer";
import todoReducer from "./todoReducer";

const reducer = combineReducers({
  vote: voteReducer,
  user: userReducer,
  todo: todoReducer,
});

export default reducer;
