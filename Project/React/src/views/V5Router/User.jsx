import React from "react";

class User extends React.Component {
  render() {
    console.log(this.props);
    return <h1>User组件</h1>;
  }
}

export default User;
