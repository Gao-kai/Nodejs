import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { bindActionCreators } from "redux";

/**
 * Provider Context组件
 * @param {*} props
 */
const StoreContext = createContext();
function Provider(props) {
  const { children, store } = props;
  return (
    <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
  );
}

function connect(mapStateToProps, mapDispatchToProps) {
  if (!mapStateToProps) {
    mapStateToProps = () => {
      return {};
    };
  }

  if (!mapDispatchToProps) {
    mapDispatchToProps = (dispatch) => {
      return {
        dispatch,
      };
    };
  }

  return function A(WrapperComponent) {
    // 返回一个函数式组件
    return function HOC(props) {
      const { store } = useContext(StoreContext);
      const state = store.getState();
      /* mapStateToProps函数执行的返回值就是组件需要注入到props的状态 */
      let nextState = useMemo(() => mapStateToProps(state), [state]);

      /* mapDispatchToProps可以是函数或者对象 */
      let dispatchProps = {};
      if (typeof mapDispatchToProps == "function") {
        dispatchProps = mapDispatchToProps(store.dispatch);
      } else if (
        typeof mapDispatchToProps == "object" &&
        mapDispatchToProps !== null
      ) {
        dispatchProps = bindActionCreators(mapDispatchToProps, store.dispatch);
      }

      /* 当state发生变化后如何更新组件 */
      const [_, forceUpdate] = useState(0);
      useEffect(() => {
        /* 返回取消订阅的方法 */
        let unsubscribe = store.subscribe(() => {
          forceUpdate(+new Date());
        });

        /* 取消订阅 */
        return () => {
          unsubscribe();
        };
      }, []);

      // 这里返回的是要渲染的组件 其实就是render函数中返回的jsx
      return (
        <WrapperComponent
          {...props}
          {...nextState}
          {...dispatchProps}
        ></WrapperComponent>
      );
    };
  };
}

export { Provider, connect };
