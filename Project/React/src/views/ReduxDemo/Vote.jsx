/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useContext } from "react";
import Main from "./Main";
import Footer from "./Footer";

// import ThemeContext from "@/themeContext.js";
import { voteActions } from "@/store/actionCreators/index";
import * as Types from "@/store/action-types";
import { connect } from "react-redux";
// import { connect } from "@/redux/react-redux";

const Vote = function Vote(props) {
  // const store = useContext(ThemeContext);

  // const { support, objection } = store.getState().vote;
  // const [_, setNum] = useState(0);

  // useEffect(() => {
  //   let unSubscribe = store.subscribe(() => {
  //     setNum(+new Date());
  //   });

  //   return unSubscribe;
  // }, []);

  const change = (type) => {
    if (type === Types.SUPPORT) {
      // store.dispatch(voteActions.support());
      addSupport();
    } else {
      // store.dispatch(voteActions.objection());
      addObjection();
    }
  };

  const { support, objection, addSupport, addObjection } = props;

  return (
    <>
      <h1>React是不是最好的JS框架?</h1>
      <h2>总票数: {support + objection}</h2>
      <h3>赞同：{support}</h3>
      <h3>反对：{objection}</h3>
      <Main></Main>
      <Footer change={change}></Footer>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    support: state.vote.support,
    objection: state.vote.objection,
  };
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     addSupport: () => {
//       dispatch(voteActions.support());
//     },
//     addObjection: () => {
//       dispatch(voteActions.objection());
//     },
//   };
// };

const mapDispatchToProps = voteActions;

export default connect(mapStateToProps, mapDispatchToProps)(Vote);
