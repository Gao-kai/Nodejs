import { Link, Outlet } from "react-router-dom";
import { Button } from "antd";

function Home(props) {
  return (
    <>
      <h1>Home组件</h1>
      <div className="home-nav-box">
        <Button type="primary">
          <Link to="/home/workspace">去首页面板</Link>
        </Button>

        <Button type="primary">
          <Link to="/home/center">去个人中心</Link>
        </Button>
      </div>
      <div className="home-router-view">
        {/* 二级路由以及多级路由渲染的容器 */}
        <Outlet></Outlet>
      </div>
    </>
  );
}

export default Home;
