import React, { useState } from "react";
import { useCallback } from "react";

class Child1 extends React.PureComponent {
  render(props) {
    console.log("子组件1渲染");
    return <h1>子组件1</h1>;
  }
}

const Child2 = React.memo((props) => {
  console.log("子组件2渲染");
  return <h1>子组件2</h1>;
});

function UseCallbackDemo() {
  const [isShow, setShow] = useState(true);
  const handleProcess = useCallback(() => {}, []);
  return (
    <>
      <Child1 handleProcess={handleProcess}></Child1>
      <Child2 handleProcess={handleProcess}></Child2>
      {isShow ? "true" : "false"}
      <button onClick={() => setShow(!isShow)}>切换</button>
    </>
  );
}

export default UseCallbackDemo;
