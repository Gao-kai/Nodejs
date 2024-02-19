import React from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

class Store {
  @observable
  counter = 10;

  @action
  add(payload) {
    console.log(this.counter);
    this.counter += payload;
  }
}

const store = new Store();

/* 类组件可以直接添加装饰器 */
@observer
class MobxDemo extends React.Component {
  render() {
    return (
      <>
        <h1>{store.counter}</h1>
        <button onClick={() => store.add(5)}>+1</button>
      </>
    );
  }
}

/* 函数式组件需要通过observer包装一层 这和装饰器有相同的效果 */
const MobxDemo1 = observer(() => {
  return (
    <>
      <h1>{store.counter}</h1>
      <button onClick={() => store.add(5)}>+1</button>
    </>
  );
});

export default MobxDemo;
