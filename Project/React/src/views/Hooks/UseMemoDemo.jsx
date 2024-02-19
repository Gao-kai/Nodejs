import { useCallback, useState, useMemo, memo, useRef } from "react";

const Person = memo((props) => {
  console.log("子组件重新被渲染");
  return (
    <div>
      <span>姓名：{props.info.name};</span>
      <span>年龄：{props.info.age};</span>
    </div>
  );
});

function UseMemoDemo() {
  const [isShow, setShow] = useState(true);
  const [personInfo] = useState({
    name: "lilei",
    age: 18,
  });

  console.log("父组件render");
  return (
    <div style={{ width: "500px", margin: "100px auto" }}>
      <Person info={personInfo}></Person>
      <button
        onClick={(e) => {
          setShow(!isShow);
        }}
      >
        切换组件
      </button>
    </div>
  );
}

export default UseMemoDemo;
