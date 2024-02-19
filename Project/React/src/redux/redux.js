import { isPlainObject } from "lodash";

function createStore(reducer) {
  let state = undefined;
  let listeners = [];

  const getState = () => {
    return state;
  };

  const dispatch = (action) => {
    if (!isPlainObject(action)) {
      throw new TypeError("action must be a plan object!");
    }

    if (!action.type) {
      throw new Error("action must has type property");
    }

    state = reducer(state, action);

    listeners.forEach((listener) => listener());

    return action;
  };

  const subscribe = (listener) => {
    if (typeof listener !== "function") {
      throw new TypeError("listener is not a function");
    }

    if (!listeners.includes(listener)) {
      listeners.push(listener);
    }

    const unsubscribe = () => {
      let index = listeners.findIndex((item) => item === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };

    return unsubscribe;
  };

  dispatch({
    type: Symbol(),
  });

  return {
    getState,
    dispatch,
    subscribe,
  };
}

export { createStore };
