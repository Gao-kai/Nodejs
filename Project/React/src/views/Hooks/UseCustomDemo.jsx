import { useState } from "react";
import { useEffect } from "react";

const useDidMount = (title) => {
  useEffect(() => {
    document.title = title;
  }, []);
};

const usePartialState = (initialValue) => {
  const [state, setState] = useState(initialValue);

  const setPartialState = (partialSstate) => {
    setState({
      ...state,
      ...partialSstate,
    });
  };

  return [state, setPartialState];
};

function UseCustomDemo() {
  const [info, setInfo] = usePartialState({
    a: 1,
    b: 2,
  });

  useDidMount("React 18!!!");

  return (
    <>
      <h1>
        {info.a} {info.b}
      </h1>

      <button onClick={() => setInfo({ b: 3 })}>onClick</button>
    </>
  );
}

export default UseCustomDemo;
