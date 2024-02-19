import {
  createRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";

function UseRefDemo(props) {
  const childRef = useRef(null);

  useEffect(() => {
    console.log("childRef", childRef.current);
  });
  return <Child ref={childRef}></Child>;
}

const Child = forwardRef(function Child(props, childRef) {
  const [counter, setCounter] = useState(0);

  const handleClick = () => {
    setCounter(counter + 1);
  };

  const btnRef = useRef(null);

  useImperativeHandle(childRef, () => {
    return {
      counter,
      setCounter,
      handleClick,
      btnEl: btnRef.current,
    };
  });

  return (
    <>
      <h1 ref={childRef}>{counter}</h1>
      <button onClick={handleClick} ref={btnRef}>
        +1
      </button>
    </>
  );
});

export default UseRefDemo;
