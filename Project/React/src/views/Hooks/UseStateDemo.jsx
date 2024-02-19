import { useState } from "react";
import { flushSync } from "react-dom";

function UseStateDemo() {
  const [counter, setCounter] = useState(0);

  const [name, setName] = useState(() => "lilei");

  const handleClick = () => {
    for (let i = 0; i < 10; i++) {
      flushSync(() => {
        setCounter((prev) => prev + 1);
      });
    }
  };

  const handleClick1 = () => {
    setCounter((counter) => counter + 2);
    setCounter((counter) => counter + 2);
    setCounter((counter) => counter + 2);
    setName((name) => name + "y");
    setName((name) => name + "y");
    setName((name) => name + "y");
  };

  const handleClick2 = () => {
    setCounter((counter) => counter + 1);
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  };

  console.log("render");
  return (
    <div style={{ width: "500px", margin: "100px auto" }}>
      <h2>{name}</h2>
      <h2>{counter}</h2>
      <button onClick={handleClick}>+1</button>
      <button onClick={handleClick1}>+2</button>
      <button onClick={handleClick2}>+1</button>
    </div>
  );
}

export default UseStateDemo;
