import { createUseStyles } from "react-jss";
import React from "react";
const useStyle = createUseStyles({
  header: {
    color: "red",
  },
  main: {
    fontSize: (props) => props.fontSize || "14px",
    "&:hover": {
      color: "blue",
    },
  },
  footer: (props) => {
    return {
      color: props.color,
      lineHeight: props.lineHeight,
    };
  },
});

function ReactJss() {
  const { header, main, footer } = useStyle({
    color: "pink",
    lineHeight: "40px",
    fontSize: "20px",
  });
  return (
    <>
      <header className={header}>header</header>
      <MyMain></MyMain>
      <footer className={footer}>footer</footer>
    </>
  );
}

class Main extends React.Component {
  render() {
    const { main } = this.props;
    return <h1 className={main}>Main</h1>;
  }
}

function WrapperMain(Component) {
  return function HOC(props) {
    const styles = useStyle({
      color: "pink",
      lineHeight: "40px",
      fontSize: "20px",
    });
    return <Component {...props} {...styles}></Component>;
  };
}

const MyMain = WrapperMain(Main);

export default ReactJss;
