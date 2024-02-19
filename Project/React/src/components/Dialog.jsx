import PropTypes from "prop-types";
import { Children, Component } from "react";
function Dialog(props) {
  const { title, content, children } = props;

  const footerList = Children.toArray(children);

  return (
    <div className="dialog">
      <div className="header">{title}</div>
      <div className="body">{content}</div>
      <div className="footer">{footerList}</div>
    </div>
  );
}

Dialog.defaultProps = {
  title: "提示",
  content: "你好",
};

Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default Dialog;

class Home extends Component {
  name = "lilei";
}

console.log(new Home());
