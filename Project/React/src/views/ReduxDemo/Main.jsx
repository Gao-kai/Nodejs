import React, { useMemo, useContext } from "react";
// import ThemeContext from "@/themeContext.js";
import { connect } from "react-redux";
// import { connect } from "@/redux/react-redux";

class Main extends React.Component {
  // static contextType = ThemeContext;
  // store = this.context;

  // componentDidMount() {
  //   this.unSubscribe = this.store.subscribe(() => {
  //     this.forceUpdate();
  //   });
  // }

  // componentWillUnmount() {
  //   this.unSubscribe();
  // }

  render() {
    // const { support, objection } = this.store.getState().vote;
    const { support, objection } = this.props;

    const getRatio = () => {
      if (support === 0) return "0%";
      const total = support + objection;
      return ((support / total) * 100).toFixed(2) + "%";
    };

    return (
      <>
        <h2>支持率{getRatio()}</h2>
      </>
    );
  }
}

const mapStateToProps = (state) => state.vote;

export default connect(mapStateToProps)(Main);
/* const Main = function () {
  const store = useContext(ThemeContext);
  const { support, objection } = store.getState();

  const ratio = useMemo(() => {
    if (support === 0) return "0%";
    const total = support + objection;
    return ((support / total) * 100).toFixed(2) + "%";
  }, [support, objection]);
}; */
