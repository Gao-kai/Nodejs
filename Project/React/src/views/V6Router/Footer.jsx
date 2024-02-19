import React from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";

class Footer extends React.Component {
  render() {
    console.log(this.props);
    return <h1>Footer组件</h1>;
  }
}

/**
 * WithRouter高阶组件的实现原理
 * @param {*} Component
 * @returns
 */
function WrapperRouter(Component) {
  return function Hoc(props) {
    return <Component {...props}></Component>;
  };
}

export default Footer;
