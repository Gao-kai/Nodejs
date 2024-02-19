import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

function UseEffectDemo() {
  const [counter, setCounter] = useState(0);
  const [name, setName] = useState("xxx");

  useEffect(() => {
    console.log("ComponentDidMount4", counter, name);

    return () => {
      console.log("ComponentDidUpdate4", counter, name);
    };
  }, [counter, name]);

  const handleClick = () => {
    setCounter((prev) => prev + 1);
    setName((name) => name + "++");
  };

  console.log("render");
  return (
    <div style={{ width: "500px", margin: "100px auto" }}>
      <h2>{name}</h2>
      <h2>{counter}</h2>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

export default UseEffectDemo;
