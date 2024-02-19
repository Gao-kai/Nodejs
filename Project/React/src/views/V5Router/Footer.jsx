import React from "react";

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
    const history = useHistory();
    const location = useLocation();
    const match = useRouteMatch();

    console.log({
      history,
      location,
      match,
    });
    return (
      <Component
        {...props}
        history={history}
        match={match}
        location={location}
      ></Component>
    );
  };
}

export default Footer;
