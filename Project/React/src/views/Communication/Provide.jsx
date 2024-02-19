import React from "react";

/**
 * 1. 创建上下文对象
 */
const VoteContext = React.createContext();

class Provide extends React.Component {
  constructor() {
    super();
    this.state = {
      support: 0,
      objection: 0,
    };
  }

  change = (type) => {
    const { support, objection } = this.state;
    if (type === "support") {
      this.setState({
        support: support + 1,
      });
    } else {
      this.setState({
        objection: objection + 1,
      });
    }
  };

  render() {
    const { support, objection } = this.state;
    return (
      /**
       * 2. 基于创建出来的VoteContext上的Provider
       * 包裹后代组件 并传入value属性提供provide给后代的属性和方法
       */
      <VoteContext.Provider
        value={{
          support,
          objection,
          change: this.change,
        }}
      >
        <h1>总票数{support + objection}</h1>
        <Main></Main>
        <Footer></Footer>
      </VoteContext.Provider>
    );
  }
}

class Main extends React.Component {
  /**
   * 3. 后代组件首先声明是使用哪一个组件组件的context
   */
  static contextType = VoteContext;

  calcRatio() {
    const { support, objection } = this.context;
    if (support === 0) return "0%";
    const total = support + objection;
    return ((support / total) * 100).toFixed(2) + "%";
  }

  render() {
    return (
      <>
        <h2>支持率{this.calcRatio()}</h2>
      </>
    );
  }
}

class Footer extends React.Component {
  render() {
    return (
      <VoteContext.Consumer>
        {(context) => {
          const { change } = context;
          return (
            <>
              <button onClick={() => change("support")}>支持</button>
              <button onClick={() => change("objection")}>反对</button>
            </>
          );
        }}
      </VoteContext.Consumer>
    );
  }
}

export default Provide;
