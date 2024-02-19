import { HashRouter, Link, Navigate, Routes, Route } from "react-router-dom";
import { Button } from "antd";
import React from "react";
import Footer from "./Footer";
import qs from "qs";
import Home from "./Home";
import About from "./About";
import User from "./User";
import UserCenter from "./home-subview/UserCenter";
import WorkSpace from "./home-subview/WorkSpace";

function AppV6Router(props) {
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
        <Routes>
          <Route path="/" element={<Navigate to="/home"></Navigate>}></Route>

          <Route path="/home" element={<Home></Home>}>
            <Route
              path="/home"
              element={<Navigate to="/home/workspace"></Navigate>}
            ></Route>

            <Route
              path="/home/workspace"
              element={<UserCenter></UserCenter>}
            ></Route>
            <Route
              path="/home/center"
              element={<WorkSpace></WorkSpace>}
            ></Route>
          </Route>

          <Route path="/about" element={<About></About>}></Route>

          <Route path="/user" element={<User></User>}></Route>

          <Route
            path="*"
            element={
              <Navigate
                to={{
                  pathname: "/home",
                  search: qs.stringify({
                    from: "404",
                  }),
                }}
                replace
              ></Navigate>
            }
          ></Route>
        </Routes>
      </div>

      {/* 没有被Route匹配后渲染的组件 */}
      <Footer a={"a"}></Footer>
    </HashRouter>
  );
}

export default AppV6Router;
