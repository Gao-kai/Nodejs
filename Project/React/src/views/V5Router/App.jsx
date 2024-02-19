import { HashRouter, Link } from "react-router-dom";
import { Button } from "antd";
import React from "react";

import RouterView from "@/router/index";
import routes from "@/router/routes";
import Footer from "./Footer";

function AppV5Router(props) {
  /* nav */
  return (
    <HashRouter>
      <div className="nav-box">
        <Button type="primary">
          <Link to="/">Home</Link>
        </Button>
        <Button type="primary">
          <Link to="/about">About</Link>
        </Button>
        <Button type="primary">
          <Link to="/user">User</Link>
        </Button>
      </div>

      <div className="router-view">
        <RouterView routes={routes}></RouterView>
        {/* <Switch>
          <Redirect exact from="/" to="/home"></Redirect>
          <Route path="/home" component={Home}></Route>
          <Route path="/about" component={About}></Route>
          <Route path="/user" component={User}></Route>
          <Route path="*" component={Page404}></Route>
        </Switch> */}
      </div>

      {/* 没有被Route匹配后渲染的组件 */}
      <Footer a={"a"}></Footer>
    </HashRouter>
  );
}

export default AppV5Router;
