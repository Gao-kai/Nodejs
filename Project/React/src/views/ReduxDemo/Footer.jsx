import { memo } from "react";

const Footer = memo(function Footer(props) {
  const { change } = props;
  console.log("Footer render");
  return (
    <>
      <button onClick={() => change("SUPPORT")}>支持</button>
      <button onClick={() => change("OBJECTION")}>反对</button>
    </>
  );
});

export default Footer;
