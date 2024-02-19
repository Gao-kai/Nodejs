import { useState, useMemo, memo, useCallback } from "react";
const Vote = function Vote() {
  const [support, setSupport] = useState(0);
  const [objection, setObjection] = useState(0);

  const change = useCallback((type) => {
    if (type === "support") {
      setSupport(support + 1);
    } else {
      setObjection(objection + 1);
    }
  }, []);

  return (
    <>
      <h1>总票数{support + objection}</h1>
      <Main support={support} objection={objection}></Main>
      <Footer change={change}></Footer>
    </>
  );
};

const Main = function Main(props) {
  const { support, objection } = props;

  const ratio = useMemo(() => {
    if (support === 0) return "0%";
    const total = support + objection;
    return ((support / total) * 100).toFixed(2) + "%";
  }, [support, objection]);

  return (
    <>
      <h2>支持率{ratio}</h2>
    </>
  );
};

const Footer = memo(function Footer(props) {
  const { change } = props;
  console.log("Footer render");
  return (
    <>
      <button onClick={() => change("support")}>支持</button>
      <button onClick={() => change("objection")}>反对</button>
    </>
  );
});

export default Vote;
